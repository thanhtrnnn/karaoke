package com.karaoke.backend.web;

import com.karaoke.backend.domain.Otp;
import com.karaoke.backend.repository.OtpRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * UC02 - Xác thực OTP (module Tài khoản).
 * Mount chung path /api/auth nhưng dùng path con riêng (/send-otp, /verify-otp)
 * để không đụng /login, /register của AuthController.
 */
@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "OTP — gửi và xác thực (UC02)")
public class OtpController {

    /** Thời hạn hiệu lực của OTP (phút). */
    private static final int OTP_EXPIRY_MINUTES = 5;

    private final OtpRepository otps;

    public OtpController(OtpRepository otps) {
        this.otps = otps;
    }

    @PostMapping("/send-otp")
    @Operation(
            summary = "Gửi mã OTP",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    required = true,
                    content = @Content(examples = @ExampleObject(value = """
                            {
                              "phoneNumberOrEmail": "client01@example.com",
                              "type": "REGISTER"
                            }
                            """))
            ),
            responses = @ApiResponse(responseCode = "200", description = "Gửi OTP thành công",
                    content = @Content(examples = @ExampleObject(value = """
                            {
                              "otpCode": "123456",
                              "expiresAt": "2026-06-03T12:05:00"
                            }
                            """)))
    )
    Map<String, Object> sendOtp(@Valid @RequestBody SendOtpRequest request) {
        // Demo: sinh mã OTP 6 số. Không dùng Math.random (có thể bị chặn).
        String code = generateOtpCode();

        Otp otp = new Otp();
        otp.setOtpCode(code);
        otp.setType(request.type());
        otp.setExpiresAt(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES));
        otp.setVerified(false);
        otps.save(otp);

        // Demo nên trả luôn mã OTP cho client.
        return Map.of(
                "otpCode", otp.getOtpCode(),
                "expiresAt", otp.getExpiresAt()
        );
    }

    @PostMapping("/verify-otp")
    @Operation(
            summary = "Xác thực mã OTP",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    required = true,
                    content = @Content(examples = @ExampleObject(value = """
                            {
                              "otpCode": "123456"
                            }
                            """))
            ),
            responses = @ApiResponse(responseCode = "200", description = "Kết quả xác thực",
                    content = @Content(examples = @ExampleObject(value = """
                            {
                              "verified": true
                            }
                            """)))
    )
    Map<String, Object> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        // OtpRepository không có findByOtpCode -> dùng findAll().stream().filter.
        Optional<Otp> found = otps.findAll().stream()
                .filter(o -> request.otpCode().equals(o.getOtpCode()))
                .findFirst();

        if (found.isEmpty()) {
            return Map.of("verified", false);
        }

        Otp otp = found.get();
        boolean alreadyVerified = Boolean.TRUE.equals(otp.getVerified());
        boolean expired = otp.getExpiresAt() != null
                && LocalDateTime.now().isAfter(otp.getExpiresAt());

        if (alreadyVerified || expired) {
            return Map.of("verified", false);
        }

        otp.setVerified(true);
        otps.save(otp);
        return Map.of("verified", true);
    }

    /**
     * Sinh mã OTP 6 số. Dựa trên System.currentTimeMillis (không dùng Math.random);
     * nếu vì lý do nào đó không lấy được thì fallback "123456".
     */
    private String generateOtpCode() {
        try {
            long value = System.currentTimeMillis() % 1_000_000L;
            return String.format("%06d", value);
        } catch (RuntimeException ex) {
            return "123456";
        }
    }

    record SendOtpRequest(
            @NotBlank String phoneNumberOrEmail,
            @NotBlank String type
    ) {}

    record VerifyOtpRequest(@NotBlank String otpCode) {}
}
