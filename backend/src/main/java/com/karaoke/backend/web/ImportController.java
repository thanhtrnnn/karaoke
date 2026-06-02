package com.karaoke.backend.web;

import com.karaoke.backend.domain.*;
import com.karaoke.backend.repository.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.persistence.EntityNotFoundException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/import-receipts")
@Tag(name = "Import Receipts", description = "Nhập kho (UC11)")
class ImportController {
    private final ImportReceiptRepository repository;
    private final ProductRepository productRepository;

    ImportController(ImportReceiptRepository repository, ProductRepository productRepository) {
        this.repository = repository;
        this.productRepository = productRepository;
    }

    @GetMapping @Operation(summary = "Danh sách phiếu nhập kho")
    List<ImportReceipt> list() { return repository.findAll(); }

    @GetMapping("/{id}") @Operation(summary = "Chi tiết phiếu nhập")
    ImportReceipt get(@PathVariable String id) {
        return repository.findById(id).orElseThrow(() -> new EntityNotFoundException("ImportReceipt not found: " + id));
    }

    // UC11: saveImportReceipt — tạo receipt + details + cập nhật product.stock
    @PostMapping @Operation(summary = "Tạo phiếu nhập kho (UC11)")
    @Transactional
    ImportReceipt create(@RequestBody ImportReceipt receipt) {
        if (receipt.getImportDate() == null) receipt.setImportDate(LocalDate.now());

        BigDecimal totalCost = BigDecimal.ZERO;
        if (receipt.getDetails() != null) {
            for (ImportDetail detail : receipt.getDetails()) {
                detail.setImportReceipt(receipt);
                if (detail.getProduct() != null) {
                    BigDecimal lineTotal = detail.getUnitCost() != null
                            ? detail.getUnitCost().multiply(BigDecimal.valueOf(detail.getQuantity()))
                            : BigDecimal.ZERO;
                    detail.setLineTotal(lineTotal);
                    totalCost = totalCost.add(lineTotal);
                    // UC11: cập nhật product.stock
                    Product product = detail.getProduct();
                    product.updateQuantity(detail.getQuantity());
                    productRepository.save(product);
                }
            }
        }
        receipt.setTotalCost(totalCost);
        return repository.save(receipt);
    }

    @PutMapping("/{id}") @Operation(summary = "Cập nhật phiếu nhập")
    ImportReceipt update(@PathVariable String id, @RequestBody ImportReceipt receipt) {
        if (!repository.existsById(id)) throw new EntityNotFoundException("ImportReceipt not found: " + id);
        receipt.setId(id);
        return repository.save(receipt);
    }
}
