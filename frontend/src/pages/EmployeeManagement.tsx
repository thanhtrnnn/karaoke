import { useState, useEffect } from 'react';

interface Employee {
  id: string;
  name: string;
  role: string;
  phone: string;
  branch: string;
  branchId: string;
  status: string;
  username: string;
}

interface Branch {
  id: string;
  name: string;
}

interface Shift {
  id: number;
  employee: { id: string; fullName: string };
  ngayLam: string;
  gioBatDau: string;
  gioKetThuc: string;
  loaiCa: string;
}

interface Timekeeping {
  id: number;
  caLamViec: { id: number; employee: { id: string; fullName: string }; ngayLam: string; loaiCa: string };
  gioVaoThuc: string | null;
  gioRaThuc: string | null;
  trangThai: string;
}

interface Evaluation {
  id: number;
  employee: { id: string; fullName: string };
  kyDanhGia: string;
  diem: number;
  nhanXet: string;
  ngayDanhGia: string;
}

interface Decision {
  id: number;
  employee: { id: string; fullName: string };
  loai: string;
  noiDung: string;
  ngayQuyetDinh: string;
}

const roleMap: Record<string, string> = {
  RECEPTIONIST: 'Lễ tân',
  SERVICE_STAFF: 'Phục vụ',
  BRANCH_MANAGER: 'Quản lý',
  ADMIN: 'Admin',
  CLIENT: 'Khách hàng',
};

const TABS = ['Nhân viên', 'Phân ca', 'Chấm công', 'Đánh giá', 'Khen thưởng'] as const;
type Tab = typeof TABS[number];

export default function EmployeeManagement() {
  const [activeTab, setActiveTab] = useState<Tab>('Nhân viên');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('Tất cả');

  // Employee CRUD state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', role: 'Lễ tân', phone: '', branchId: '', status: 'Working', username: '', password: '' });

  // Shift state
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [shiftForm, setShiftForm] = useState({ employeeId: '', ngayLam: '', gioBatDau: '08:00', gioKetThuc: '17:00', loaiCa: 'Sáng' });
  const [shiftMsg, setShiftMsg] = useState('');

  // Timekeeping state
  const [timekeeping, setTimekeeping] = useState<Timekeeping[]>([]);

  // Evaluation state
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [evalForm, setEvalForm] = useState({ employeeId: '', kyDanhGia: '', diem: 8, nhanXet: '' });
  const [evalMsg, setEvalMsg] = useState('');

  // Decision state
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [decForm, setDecForm] = useState({ employeeId: '', loai: 'KhenThuong', noiDung: '' });
  const [decMsg, setDecMsg] = useState('');

  const token = localStorage.getItem('token');
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  // Load employees + branches
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empRes, branchRes] = await Promise.all([
          fetch('/api/employees', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/branches', { headers: { 'Authorization': `Bearer ${token}` } }),
        ]);
        if (empRes.ok) {
          const data = await empRes.json();
          setEmployees(data.map((e: any) => ({
            id: e.id, name: e.fullName, role: roleMap[e.role] || e.role,
            phone: e.tel || e.phone || '', branch: e.branch?.name || 'N/A',
            branchId: e.branch?.id || '', status: e.status || 'Working', username: e.username || '',
          })));
        }
        if (branchRes.ok) setBranches((await branchRes.json()).map((b: any) => ({ id: b.id, name: b.name })));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  // Load shifts when tab changes
  useEffect(() => {
    if (activeTab === 'Phân ca') {
      fetch('/api/shifts', { headers: { 'Authorization': `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : []).then(setShifts).catch(() => {});
    }
    if (activeTab === 'Chấm công') {
      fetch('/api/timekeeping', { headers: { 'Authorization': `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : []).then(setTimekeeping).catch(() => {});
    }
    if (activeTab === 'Đánh giá') {
      fetch('/api/evaluations', { headers: { 'Authorization': `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : []).then(setEvaluations).catch(() => {});
    }
    if (activeTab === 'Khen thưởng') {
      fetch('/api/decisions', { headers: { 'Authorization': `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : []).then(setDecisions).catch(() => {});
    }
  }, [activeTab]);

  const filteredEmployees = employees.filter(e => {
    const matchRole = filterRole === 'Tất cả' || e.role === filterRole;
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) || e.phone.includes(search);
    return matchRole && matchSearch;
  });

  // --- Employee CRUD ---
  const handleOpenModal = (emp?: any) => {
    if (emp) {
      setEditingEmp(emp);
      setFormData({ name: emp.name, role: emp.role, phone: emp.phone, branchId: emp.branchId || '', status: emp.status || 'Working', username: emp.username || '', password: '' });
    } else {
      setEditingEmp(null);
      setFormData({ name: '', role: 'Lễ tân', phone: '', branchId: branches.length > 0 ? branches[0].id : '', status: 'Working', username: '', password: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.phone) { alert('Vui lòng nhập đủ thông tin.'); return; }
    const reverseRoleMap: Record<string, string> = { 'Lễ tân': 'RECEPTIONIST', 'Phục vụ': 'SERVICE_STAFF', 'Quản lý': 'BRANCH_MANAGER' };
    const body: Record<string, unknown> = {
      fullName: formData.name, tel: formData.phone, role: reverseRoleMap[formData.role] || formData.role,
      status: formData.status, username: formData.username || undefined,
    };
    if (formData.password && !editingEmp) body.password = formData.password;
    if (formData.branchId) body.branch = { id: formData.branchId };
    if (!editingEmp) body.id = `NV${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    try {
      const url = editingEmp ? `/api/employees/${editingEmp.id}` : '/api/employees';
      const method = editingEmp ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers, body: JSON.stringify(body) });
      if (res.ok) {
        const created = await res.json();
        const mapped = { id: created.id, name: created.fullName, role: roleMap[created.role] || created.role, phone: created.tel || '', branch: created.branch?.name || 'N/A', branchId: created.branch?.id || '', status: created.status || 'Working', username: created.username || '' };
        setEmployees(editingEmp ? employees.map(e => e.id === mapped.id ? mapped : e) : [...employees, mapped]);
      }
    } catch (e) { console.error(e); }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa nhân viên này?')) return;
    const res = await fetch(`/api/employees/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) setEmployees(employees.filter(e => e.id !== id));
  };

  // --- Shift ---
  const handleCreateShift = async () => {
    if (!shiftForm.employeeId || !shiftForm.ngayLam) { setShiftMsg('❌ Chọn nhân viên và ngày'); return; }
    setShiftMsg('');
    const res = await fetch('/api/shifts', { method: 'POST', headers, body: JSON.stringify(shiftForm) });
    if (res.ok) {
      const created = await res.json();
      setShifts([created, ...shifts]);
      setShiftMsg('✅ Phân ca thành công — Chấm công tự khởi tạo');
    } else {
      const err = await res.json().catch(() => ({}));
      setShiftMsg(`❌ ${err.message || 'Lỗi phân ca'}`);
    }
  };

  // --- Evaluation ---
  const handleCreateEval = async () => {
    if (!evalForm.employeeId || !evalForm.kyDanhGia) { setEvalMsg('❌ Chọn nhân viên và kỳ đánh giá'); return; }
    setEvalMsg('');
    const res = await fetch('/api/evaluations', { method: 'POST', headers, body: JSON.stringify(evalForm) });
    if (res.ok) {
      const created = await res.json();
      setEvaluations([created, ...evaluations]);
      setEvalMsg('✅ Lưu đánh giá thành công');
    } else { setEvalMsg('❌ Lỗi lưu đánh giá'); }
  };

  // --- Decision ---
  const handleCreateDecision = async () => {
    if (!decForm.employeeId || !decForm.noiDung) { setDecMsg('❌ Chọn nhân viên và nhập nội dung'); return; }
    setDecMsg('');
    const res = await fetch('/api/decisions', { method: 'POST', headers, body: JSON.stringify(decForm) });
    if (res.ok) {
      const created = await res.json();
      setDecisions([created, ...decisions]);
      setDecMsg('✅ Lưu quyết định thành công');
    } else { setDecMsg('❌ Lỗi lưu quyết định'); }
  };

  if (loading) return <div className="p-8 text-slate-400">Đang tải...</div>;

  return (
    <div className="p-8 max-w-[1600px] mx-auto w-full space-y-6">
      {/* Tab bar */}
      <div className="flex gap-1 bg-surface-container rounded-xl p-1 border border-slate-700/50">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 px-4 rounded-lg font-body-md text-sm transition-colors ${activeTab === tab ? 'bg-primary-container text-on-primary-container font-semibold' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Tab: Nhân viên */}
      {activeTab === 'Nhân viên' && (
        <>
          <div className="flex justify-between items-center">
            <h1 className="font-h1 text-white">Quản lý nhân viên</h1>
            <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-6 py-2.5 bg-primary-container text-on-primary-container rounded-lg font-body-md font-semibold hover:bg-primary transition-colors">
              <span className="material-symbols-outlined text-[20px]">add</span>Thêm NV
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-4 bg-surface-container rounded-xl p-5 border border-slate-700/50">
            <div className="relative flex-1 min-w-[250px]">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[20px]">search</span>
              <input value={search} onChange={e => setSearch(e.target.value)}
                className="w-full bg-surface-secondary border border-slate-700/50 rounded-lg py-2.5 pl-11 pr-4 text-white font-body-md focus:outline-none focus:border-[#D4AF37] placeholder:text-slate-500"
                placeholder="Tìm kiếm nhân viên (Tên hoặc SĐT)..." />
            </div>
            <div className="relative min-w-[220px]">
              <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
                className="w-full appearance-none bg-surface-secondary border border-slate-700/50 rounded-lg py-2.5 pl-4 pr-10 text-white font-body-md focus:outline-none focus:border-[#D4AF37] cursor-pointer">
                <option value="Tất cả">Tất cả vai trò</option>
                <option value="Lễ tân">Lễ tân</option>
                <option value="Phục vụ">Phục vụ</option>
                <option value="Quản lý">Quản lý</option>
              </select>
            </div>
          </div>
          <div className="bg-surface-container rounded-xl border border-slate-700/50 overflow-hidden overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-700/50 text-slate-400 font-label-caps bg-surface-container-low">
                  <th className="py-4 px-6">Mã NV</th><th className="py-4 px-6">Họ tên</th><th className="py-4 px-6">Vai trò</th><th className="py-4 px-6">SĐT</th><th className="py-4 px-6">Chi nhánh</th><th className="py-4 px-6">Trạng thái</th><th className="py-4 px-6">Thao tác</th>
                </tr>
              </thead>
              <tbody className="font-body-md divide-y divide-slate-800/50">
                {filteredEmployees.map(e => (
                  <tr key={e.id} className="hover:bg-slate-900/30 transition-colors">
                    <td className="py-4 px-6 text-primary-container font-medium">{e.id}</td>
                    <td className="py-4 px-6 text-white">{e.name}</td>
                    <td className="py-4 px-6"><span className={`px-2.5 py-1 rounded-md font-label-caps ${e.role === 'Quản lý' ? 'bg-secondary/10 text-secondary border border-secondary/20' : e.role === 'Lễ tân' ? 'bg-primary-container/10 text-primary-container border border-primary-container/20' : 'bg-slate-800 text-slate-400 border border-slate-700/50'}`}>{e.role}</span></td>
                    <td className="py-4 px-6">{e.phone}</td>
                    <td className="py-4 px-6">{e.branch}</td>
                    <td className="py-4 px-6"><span className={`px-2 py-1 rounded-full text-xs font-medium ${e.status === 'Working' ? 'bg-green-900/50 text-green-300' : e.status === 'Resigned' ? 'bg-red-900/50 text-red-300' : 'bg-yellow-900/50 text-yellow-300'}`}>{e.status === 'Working' ? 'Đang làm' : e.status === 'Resigned' ? 'Nghỉ việc' : e.status || 'Đang làm'}</span></td>
                    <td className="py-4 px-6 flex gap-2">
                      <button onClick={() => handleOpenModal(e)} className="px-3 py-1.5 bg-surface-secondary border border-border-subtle rounded-lg text-slate-300 hover:border-primary-container hover:text-primary-container transition-colors font-label-caps">Sửa</button>
                      <button onClick={() => handleDelete(e.id)} className="px-3 py-1.5 bg-status-occupied/10 border border-status-occupied/20 rounded-lg text-status-occupied hover:bg-status-occupied hover:text-white transition-colors font-label-caps">Xóa</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Tab: Phân ca */}
      {activeTab === 'Phân ca' && (
        <>
          <h1 className="font-h1 text-white">Phân ca làm việc</h1>
          <div className="bg-surface-container rounded-xl border border-slate-700/50 p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1 uppercase">Nhân viên</label>
                <select value={shiftForm.employeeId} onChange={e => setShiftForm({...shiftForm, employeeId: e.target.value})}
                  className="w-full bg-surface-secondary border border-slate-700/50 rounded-lg px-3 py-2 text-white text-sm">
                  <option value="">-- Chọn NV --</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.name} ({e.role})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1 uppercase">Ngày</label>
                <input type="date" value={shiftForm.ngayLam} onChange={e => setShiftForm({...shiftForm, ngayLam: e.target.value})}
                  className="w-full bg-surface-secondary border border-slate-700/50 rounded-lg px-3 py-2 text-white text-sm" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1 uppercase">Bắt đầu</label>
                <input type="time" value={shiftForm.gioBatDau} onChange={e => setShiftForm({...shiftForm, gioBatDau: e.target.value})}
                  className="w-full bg-surface-secondary border border-slate-700/50 rounded-lg px-3 py-2 text-white text-sm" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1 uppercase">Kết thúc</label>
                <input type="time" value={shiftForm.gioKetThuc} onChange={e => setShiftForm({...shiftForm, gioKetThuc: e.target.value})}
                  className="w-full bg-surface-secondary border border-slate-700/50 rounded-lg px-3 py-2 text-white text-sm" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1 uppercase">Loại ca</label>
                <select value={shiftForm.loaiCa} onChange={e => setShiftForm({...shiftForm, loaiCa: e.target.value})}
                  className="w-full bg-surface-secondary border border-slate-700/50 rounded-lg px-3 py-2 text-white text-sm">
                  <option>Sáng</option><option>Chiều</option><option>Tối</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={handleCreateShift} className="px-5 py-2 bg-primary-container text-on-primary-container rounded-lg font-semibold hover:bg-primary transition-colors">Lưu phân ca</button>
              {shiftMsg && <span className={`text-sm ${shiftMsg.startsWith('✅') ? 'text-green-400' : 'text-red-400'}`}>{shiftMsg}</span>}
            </div>
          </div>
          <div className="bg-surface-container rounded-xl border border-slate-700/50 overflow-hidden overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead><tr className="border-b border-slate-700/50 text-slate-400 font-label-caps bg-surface-container-low">
                <th className="py-3 px-5">NV</th><th className="py-3 px-5">Ngày</th><th className="py-3 px-5">Giờ</th><th className="py-3 px-5">Loại ca</th>
              </tr></thead>
              <tbody className="font-body-md divide-y divide-slate-800/50">
                {shifts.map(s => (
                  <tr key={s.id} className="hover:bg-slate-900/30">
                    <td className="py-3 px-5 text-white">{s.employee?.fullName || s.employee?.id}</td>
                    <td className="py-3 px-5">{s.ngayLam}</td>
                    <td className="py-3 px-5">{s.gioBatDau}–{s.gioKetThuc}</td>
                    <td className="py-3 px-5">{s.loaiCa}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Tab: Chấm công */}
      {activeTab === 'Chấm công' && (
        <>
          <h1 className="font-h1 text-white">Bảng chấm công</h1>
          <div className="bg-surface-container rounded-xl border border-slate-700/50 overflow-hidden overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead><tr className="border-b border-slate-700/50 text-slate-400 font-label-caps bg-surface-container-low">
                <th className="py-3 px-5">NV</th><th className="py-3 px-5">Ngày</th><th className="py-3 px-5">Ca</th><th className="py-3 px-5">Giờ vào</th><th className="py-3 px-5">Giờ ra</th><th className="py-3 px-5">Trạng thái</th>
              </tr></thead>
              <tbody className="font-body-md divide-y divide-slate-800/50">
                {timekeeping.map(t => (
                  <tr key={t.id} className="hover:bg-slate-900/30">
                    <td className="py-3 px-5 text-white">{t.caLamViec?.employee?.fullName || t.caLamViec?.employee?.id}</td>
                    <td className="py-3 px-5">{t.caLamViec?.ngayLam}</td>
                    <td className="py-3 px-5">{t.caLamViec?.loaiCa}</td>
                    <td className="py-3 px-5">{t.gioVaoThuc ? new Date(t.gioVaoThuc).toLocaleTimeString('vi-VN') : '—'}</td>
                    <td className="py-3 px-5">{t.gioRaThuc ? new Date(t.gioRaThuc).toLocaleTimeString('vi-VN') : '—'}</td>
                    <td className="py-3 px-5">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${t.trangThai === 'DungGio' ? 'bg-green-900/50 text-green-300' : t.trangThai === 'Muon' ? 'bg-yellow-900/50 text-yellow-300' : t.trangThai === 'Vang' ? 'bg-red-900/50 text-red-300' : 'bg-slate-800 text-slate-400'}`}>
                        {t.trangThai === 'DungGio' ? 'Đúng giờ' : t.trangThai === 'Muon' ? 'Muộn' : t.trangThai === 'Vang' ? 'Vắng' : t.trangThai === 'ChoChamCong' ? 'Chờ chấm' : t.trangThai}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Tab: Đánh giá */}
      {activeTab === 'Đánh giá' && (
        <>
          <h1 className="font-h1 text-white">Đánh giá hiệu suất</h1>
          <div className="bg-surface-container rounded-xl border border-slate-700/50 p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1 uppercase">Nhân viên</label>
                <select value={evalForm.employeeId} onChange={e => setEvalForm({...evalForm, employeeId: e.target.value})}
                  className="w-full bg-surface-secondary border border-slate-700/50 rounded-lg px-3 py-2 text-white text-sm">
                  <option value="">-- Chọn NV --</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1 uppercase">Kỳ đánh giá</label>
                <input value={evalForm.kyDanhGia} onChange={e => setEvalForm({...evalForm, kyDanhGia: e.target.value})}
                  placeholder="VD: Tháng 6/2026" className="w-full bg-surface-secondary border border-slate-700/50 rounded-lg px-3 py-2 text-white text-sm" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1 uppercase">Điểm (0–10)</label>
                <input type="number" min={0} max={10} step={0.5} value={evalForm.diem}
                  onChange={e => setEvalForm({...evalForm, diem: parseFloat(e.target.value) || 0})}
                  className="w-full bg-surface-secondary border border-slate-700/50 rounded-lg px-3 py-2 text-white text-sm" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1 uppercase">Nhận xét</label>
                <input value={evalForm.nhanXet} onChange={e => setEvalForm({...evalForm, nhanXet: e.target.value})}
                  placeholder="Nhận xét..." className="w-full bg-surface-secondary border border-slate-700/50 rounded-lg px-3 py-2 text-white text-sm" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={handleCreateEval} className="px-5 py-2 bg-primary-container text-on-primary-container rounded-lg font-semibold hover:bg-primary transition-colors">Lưu đánh giá</button>
              {evalMsg && <span className={`text-sm ${evalMsg.startsWith('✅') ? 'text-green-400' : 'text-red-400'}`}>{evalMsg}</span>}
            </div>
          </div>
          <div className="bg-surface-container rounded-xl border border-slate-700/50 overflow-hidden overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead><tr className="border-b border-slate-700/50 text-slate-400 font-label-caps bg-surface-container-low">
                <th className="py-3 px-5">NV</th><th className="py-3 px-5">Kỳ</th><th className="py-3 px-5">Điểm</th><th className="py-3 px-5">Nhận xét</th><th className="py-3 px-5">Ngày</th>
              </tr></thead>
              <tbody className="font-body-md divide-y divide-slate-800/50">
                {evaluations.map(ev => (
                  <tr key={ev.id} className="hover:bg-slate-900/30">
                    <td className="py-3 px-5 text-white">{ev.employee?.fullName || ev.employee?.id}</td>
                    <td className="py-3 px-5">{ev.kyDanhGia}</td>
                    <td className="py-3 px-5 text-primary-container font-semibold">{ev.diem}</td>
                    <td className="py-3 px-5 text-slate-300">{ev.nhanXet}</td>
                    <td className="py-3 px-5">{ev.ngayDanhGia}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Tab: Khen thưởng / Kỷ luật */}
      {activeTab === 'Khen thưởng' && (
        <>
          <h1 className="font-h1 text-white">Khen thưởng / Kỷ luật</h1>
          <div className="bg-surface-container rounded-xl border border-slate-700/50 p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1 uppercase">Nhân viên</label>
                <select value={decForm.employeeId} onChange={e => setDecForm({...decForm, employeeId: e.target.value})}
                  className="w-full bg-surface-secondary border border-slate-700/50 rounded-lg px-3 py-2 text-white text-sm">
                  <option value="">-- Chọn NV --</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1 uppercase">Loại</label>
                <select value={decForm.loai} onChange={e => setDecForm({...decForm, loai: e.target.value})}
                  className="w-full bg-surface-secondary border border-slate-700/50 rounded-lg px-3 py-2 text-white text-sm">
                  <option value="KhenThuong">Khen thưởng</option>
                  <option value="KyLuat">Kỷ luật</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1 uppercase">Nội dung</label>
                <input value={decForm.noiDung} onChange={e => setDecForm({...decForm, noiDung: e.target.value})}
                  placeholder="Nội dung quyết định..." className="w-full bg-surface-secondary border border-slate-700/50 rounded-lg px-3 py-2 text-white text-sm" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={handleCreateDecision} className="px-5 py-2 bg-primary-container text-on-primary-container rounded-lg font-semibold hover:bg-primary transition-colors">Lưu quyết định</button>
              {decMsg && <span className={`text-sm ${decMsg.startsWith('✅') ? 'text-green-400' : 'text-red-400'}`}>{decMsg}</span>}
            </div>
          </div>
          <div className="bg-surface-container rounded-xl border border-slate-700/50 overflow-hidden overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead><tr className="border-b border-slate-700/50 text-slate-400 font-label-caps bg-surface-container-low">
                <th className="py-3 px-5">NV</th><th className="py-3 px-5">Loại</th><th className="py-3 px-5">Nội dung</th><th className="py-3 px-5">Ngày</th>
              </tr></thead>
              <tbody className="font-body-md divide-y divide-slate-800/50">
                {decisions.map(d => (
                  <tr key={d.id} className="hover:bg-slate-900/30">
                    <td className="py-3 px-5 text-white">{d.employee?.fullName || d.employee?.id}</td>
                    <td className="py-3 px-5"><span className={`px-2 py-1 rounded-full text-xs font-medium ${d.loai === 'KhenThuong' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>{d.loai === 'KhenThuong' ? 'Khen thưởng' : 'Kỷ luật'}</span></td>
                    <td className="py-3 px-5 text-slate-300">{d.noiDung}</td>
                    <td className="py-3 px-5">{d.ngayQuyetDinh}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Employee CRUD Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-container border border-slate-700/50 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-h2 text-white">{editingEmp ? 'Cập Nhật Nhân Viên' : 'Thêm Nhân Viên Mới'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><span className="material-symbols-outlined">close</span></button>
            </div>
            <div className="space-y-4 mb-6">
              <div><label className="block text-slate-400 font-body-md mb-2">Họ & Tên</label><input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-surface-secondary border border-border-subtle rounded-lg px-4 py-2.5 text-white font-body-md focus:outline-none focus:border-primary-container" placeholder="VD: Nguyễn Văn A" /></div>
              <div><label className="block text-slate-400 font-body-md mb-2">Số điện thoại</label><input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-surface-secondary border border-border-subtle rounded-lg px-4 py-2.5 text-white font-body-md focus:outline-none focus:border-primary-container" placeholder="VD: 0901234567" /></div>
              <div><label className="block text-slate-400 font-body-md mb-2">Vai trò</label><select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full bg-surface-secondary border border-border-subtle rounded-lg px-4 py-2.5 text-white font-body-md focus:outline-none focus:border-primary-container"><option>Lễ tân</option><option>Phục vụ</option><option>Quản lý</option></select></div>
              <div><label className="block text-slate-400 font-body-md mb-2">Chi nhánh</label><select value={formData.branchId} onChange={e => setFormData({...formData, branchId: e.target.value})} className="w-full bg-surface-secondary border border-border-subtle rounded-lg px-4 py-2.5 text-white font-body-md focus:outline-none focus:border-primary-container">{branches.length === 0 && <option value="">Không có chi nhánh</option>}{branches.map(b => <option key={b.id} value={b.id}>{b.id} - {b.name}</option>)}</select></div>
              <div><label className="block text-slate-400 font-body-md mb-2">Trạng thái</label><select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-surface-secondary border border-border-subtle rounded-lg px-4 py-2.5 text-white font-body-md focus:outline-none focus:border-primary-container"><option value="Working">Đang làm</option><option value="Resigned">Nghỉ việc</option><option value="OnLeave">Nghỉ phép</option></select></div>
              {!editingEmp && (<>
                <div><label className="block text-slate-400 font-body-md mb-2">Tên đăng nhập</label><input value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full bg-surface-secondary border border-border-subtle rounded-lg px-4 py-2.5 text-white font-body-md focus:outline-none focus:border-primary-container" placeholder="Để trống dùng mã NV" /></div>
                <div><label className="block text-slate-400 font-body-md mb-2">Mật khẩu ban đầu</label><input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-surface-secondary border border-border-subtle rounded-lg px-4 py-2.5 text-white font-body-md focus:outline-none focus:border-primary-container" placeholder="Ít nhất 6 ký tự" /></div>
              </>)}
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 border border-slate-700/50 text-slate-300 rounded-lg font-body-md hover:bg-surface-secondary transition-colors">Hủy</button>
              <button onClick={handleSave} className="px-6 py-2.5 bg-primary-container text-on-primary-container rounded-lg font-body-md font-semibold hover:bg-primary transition-colors">Lưu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
