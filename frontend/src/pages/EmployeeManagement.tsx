import { useState, useEffect } from 'react';

interface Employee {
  id: string;
  name: string;
  role: string;
  phone: string;
  branch: string;
}

const roleMap: Record<string, string> = {
  RECEPTIONIST: 'Lễ tân',
  SERVICE_STAFF: 'Phục vụ',
  BRANCH_MANAGER: 'Quản lý',
  ADMIN: 'Admin',
  CLIENT: 'Khách hàng',
};

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('Tất cả');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', role: 'Lễ tân', phone: '', branch: 'CN1 - Quận 1' });

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/employees', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setEmployees(data.map((e: any) => ({
            id: e.id,
            name: e.fullName,
            role: roleMap[e.role] || e.role,
            phone: e.phone,
            branch: e.branch?.name || 'N/A',
          })));
        }
      } catch (e) {
        console.error('Failed to fetch employees:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  const filteredEmployees = employees.filter(e => {
    const matchRole = filterRole === 'Tất cả' || e.role === filterRole;
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) || e.phone.includes(search);
    return matchRole && matchSearch;
  });

  const handleOpenModal = (emp?: any) => {
    if (emp) {
      setEditingEmp(emp);
      setFormData({ name: emp.name, role: emp.role, phone: emp.phone, branch: emp.branch });
    } else {
      setEditingEmp(null);
      setFormData({ name: '', role: 'Lễ tân', phone: '', branch: 'CN1 - Quận 1' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.phone) {
      alert("Vui lòng nhập đủ thông tin.");
      return;
    }

    const reverseRoleMap: Record<string, string> = {
      'Lễ tân': 'RECEPTIONIST',
      'Phục vụ': 'SERVICE_STAFF',
      'Quản lý': 'BRANCH_MANAGER',
    };

    const body = {
      fullName: formData.name,
      phone: formData.phone,
      role: reverseRoleMap[formData.role] || formData.role,
    };

    try {
      const token = localStorage.getItem('token');
      if (editingEmp) {
        const res = await fetch(`/api/employees/${editingEmp.id}`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (res.ok) {
          setEmployees(employees.map(e => e.id === editingEmp.id ? { ...e, ...formData } : e));
        }
      } else {
        const res = await fetch('/api/employees', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (res.ok) {
          const created = await res.json();
          setEmployees([...employees, {
            id: created.id,
            name: created.fullName,
            role: roleMap[created.role] || created.role,
            phone: created.phone,
            branch: created.branch?.name || 'N/A',
          }]);
        }
      }
    } catch (e) {
      console.error('Failed to save employee:', e);
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc muốn xóa nhân viên này?")) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/employees/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setEmployees(employees.filter(e => e.id !== id));
        }
      } catch (e) {
        console.error('Failed to delete employee:', e);
      }
    }
  };

  if (loading) {
    return <div className="p-8 text-slate-400">Đang tải danh sách nhân viên...</div>;
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto w-full space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="font-h1 text-white">Quản lý nhân viên</h1>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary-container text-on-primary-container rounded-lg font-body-md font-semibold hover:bg-primary transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>Thêm NV
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-4 bg-surface-container rounded-xl p-5 border border-slate-700/50">
        <div className="relative flex-1 min-w-[250px]">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[20px]">search</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-secondary border border-slate-700/50 rounded-lg py-2.5 pl-11 pr-4 text-white font-body-md focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] hover:border-slate-500 transition-all placeholder:text-slate-500"
            placeholder="Tìm kiếm nhân viên (Tên hoặc SĐT)..."
          />
        </div>
        <div className="relative min-w-[220px]">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="w-full appearance-none bg-none bg-surface-secondary border border-slate-700/50 rounded-lg py-2.5 pl-4 pr-10 text-white font-body-md focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] hover:border-slate-500 transition-all cursor-pointer"
          >
            <option value="Tất cả">Tất cả vai trò</option>
            <option value="Lễ tân">Lễ tân</option>
            <option value="Phục vụ">Phục vụ</option>
            <option value="Quản lý">Quản lý</option>
          </select>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 pointer-events-none">expand_more</span>
        </div>
      </div>
      <div className="bg-surface-container rounded-xl border border-slate-700/50 overflow-hidden overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap">
          <thead>
            <tr className="border-b border-slate-700/50 text-slate-400 font-label-caps bg-surface-container-low">
              <th className="py-4 px-6">Mã NV</th><th className="py-4 px-6">Họ tên</th><th className="py-4 px-6">Vai trò</th><th className="py-4 px-6">SĐT</th><th className="py-4 px-6">Chi nhánh</th><th className="py-4 px-6">Thao tác</th>
            </tr>
          </thead>
          <tbody className="font-body-md divide-y divide-slate-800/50">
            {filteredEmployees.map((e) => (
              <tr key={e.id} className="hover:bg-slate-900/30 transition-colors">
                <td className="py-4 px-6 text-primary-container font-medium">{e.id}</td>
                <td className="py-4 px-6 text-white">{e.name}</td>
                <td className="py-4 px-6">
                  <span className={`px-2.5 py-1 rounded-md font-label-caps ${e.role === 'Quản lý' ? 'bg-secondary/10 text-secondary border border-secondary/20' : e.role === 'Lễ tân' ? 'bg-primary-container/10 text-primary-container border border-primary-container/20' : 'bg-slate-800 text-slate-400 border border-slate-700/50'}`}>
                    {e.role}
                  </span>
                </td>
                <td className="py-4 px-6">{e.phone}</td>
                <td className="py-4 px-6">{e.branch}</td>
                <td className="py-4 px-6 flex gap-2">
                  <button
                    onClick={() => handleOpenModal(e)}
                    className="px-3 py-1.5 bg-surface-secondary border border-border-subtle rounded-lg text-slate-300 hover:border-primary-container hover:text-primary-container transition-colors font-label-caps"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(e.id)}
                    className="px-3 py-1.5 bg-status-occupied/10 border border-status-occupied/20 rounded-lg text-status-occupied hover:bg-status-occupied hover:text-white transition-colors font-label-caps"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-container border border-slate-700/50 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-h2 text-white">{editingEmp ? 'Cập Nhật Nhân Viên' : 'Thêm Nhân Viên Mới'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-slate-400 font-body-md mb-2">Họ & Tên</label>
                <input
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-surface-secondary border border-border-subtle rounded-lg px-4 py-2.5 text-white font-body-md focus:outline-none focus:border-primary-container"
                  placeholder="VD: Nguyễn Văn A"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-body-md mb-2">Số điện thoại</label>
                <input
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-surface-secondary border border-border-subtle rounded-lg px-4 py-2.5 text-white font-body-md focus:outline-none focus:border-primary-container"
                  placeholder="VD: 0901234567"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-body-md mb-2">Vai trò</label>
                <select
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value})}
                  className="w-full bg-surface-secondary border border-border-subtle rounded-lg px-4 py-2.5 text-white font-body-md focus:outline-none focus:border-primary-container"
                >
                  <option value="Lễ tân">Lễ tân</option>
                  <option value="Phục vụ">Phục vụ</option>
                  <option value="Quản lý">Quản lý</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 font-body-md mb-2">Chi nhánh</label>
                <select
                  value={formData.branch}
                  onChange={e => setFormData({...formData, branch: e.target.value})}
                  className="w-full bg-surface-secondary border border-border-subtle rounded-lg px-4 py-2.5 text-white font-body-md focus:outline-none focus:border-primary-container"
                >
                  <option value="CN1 - Quận 1">CN1 - Quận 1</option>
                  <option value="CN2 - Quận 3">CN2 - Quận 3</option>
                  <option value="CN3 - Quận 7">CN3 - Quận 7</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 border border-slate-700/50 text-slate-300 rounded-lg font-body-md hover:bg-surface-secondary transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2.5 bg-primary-container text-on-primary-container rounded-lg font-body-md font-semibold hover:bg-primary transition-colors"
              >
                Lưu Thông Tin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
