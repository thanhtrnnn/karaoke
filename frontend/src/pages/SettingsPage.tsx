import { useState } from 'react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('Thông tin chung');
  const tabs = ['Thông tin chung', 'Chi nhánh', 'Bảng giá', 'Khác'];

  const [branches, setBranches] = useState([
    { id: 'CN01', name: 'CN Quận 1', address: '123 Lê Lợi, Q1' },
    { id: 'CN02', name: 'CN Quận 3', address: '456 Võ Văn Tần, Q3' }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<any>(null);
  const [branchForm, setBranchForm] = useState({ name: '', address: '' });

  const handleOpenModal = (branch?: any) => {
    if (branch) {
      setEditingBranch(branch);
      setBranchForm({ name: branch.name, address: branch.address });
    } else {
      setEditingBranch(null);
      setBranchForm({ name: '', address: '' });
    }
    setIsModalOpen(true);
  };

  const handleSaveBranch = () => {
    if (!branchForm.name) return;
    if (editingBranch) {
      setBranches(branches.map(b => b.id === editingBranch.id ? { ...b, ...branchForm } : b));
    } else {
      const newId = `CN0${branches.length + 1}`;
      setBranches([...branches, { id: newId, ...branchForm }]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteBranch = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa chi nhánh này?')) {
      setBranches(branches.filter(b => b.id !== id));
    }
  };

  const handleSaveConfig = () => {
    alert('Lưu cấu hình hệ thống thành công!');
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto w-full space-y-6">
      <h1 className="font-h1 text-white">Cấu hình hệ thống</h1>
      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700/50 pb-0">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-3 font-body-md transition-colors border-b-2 ${activeTab === tab ? 'text-primary-container border-primary-container font-semibold' : 'text-slate-400 border-transparent hover:text-white'}`}
          >
            {tab}
          </button>
        ))}
      </div>
      {/* General Settings */}
      {/* General Settings */}
      {activeTab === 'Thông tin chung' && (
        <div className="bg-surface-container rounded-xl border border-slate-700/50 p-6 animate-fade-in">
          <h2 className="font-h2 text-white mb-4">Thông tin chung</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><label className="font-label-caps text-slate-400 uppercase block mb-2">Tên chuỗi</label><input className="w-full bg-surface-secondary border border-border-subtle rounded-lg px-4 py-3 text-white font-body-md focus:outline-none focus:border-primary-container" defaultValue="Karaoke Famtaoke" /></div>
            <div><label className="font-label-caps text-slate-400 uppercase block mb-2">Hotline</label><input className="w-full bg-surface-secondary border border-border-subtle rounded-lg px-4 py-3 text-white font-body-md focus:outline-none focus:border-primary-container" defaultValue="1900 1234" /></div>
            <div><label className="font-label-caps text-slate-400 uppercase block mb-2">Email</label><input className="w-full bg-surface-secondary border border-border-subtle rounded-lg px-4 py-3 text-white font-body-md focus:outline-none focus:border-primary-container" defaultValue="admin@karaoke.com" /></div>
            <div><label className="font-label-caps text-slate-400 uppercase block mb-2">Logo</label><button onClick={() => alert('Mở cửa sổ chọn file ảnh...')} className="w-full bg-surface-secondary border border-border-subtle border-dashed rounded-lg px-4 py-3 text-slate-400 font-body-md hover:border-primary-container hover:text-primary-container transition-colors">Chọn file...</button></div>
          </div>
          <div className="mt-6 pt-6 border-t border-slate-700/50">
            <h3 className="font-label-caps text-slate-400 uppercase mb-4">Cài đặt tích điểm</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3"><span className="text-slate-400 font-body-md">1,000đ =</span><input type="number" className="w-20 bg-surface-secondary border border-border-subtle rounded-lg px-3 py-2 text-white font-body-md text-center focus:outline-none focus:border-primary-container" defaultValue={1} /><span className="text-slate-400 font-body-md">điểm</span></div>
              <div className="flex items-center gap-3"><span className="text-slate-400 font-body-md">Quy đổi:</span><input type="number" className="w-20 bg-surface-secondary border border-border-subtle rounded-lg px-3 py-2 text-white font-body-md text-center focus:outline-none focus:border-primary-container" defaultValue={100} /><span className="text-slate-400 font-body-md">điểm =</span><input className="w-28 bg-surface-secondary border border-border-subtle rounded-lg px-3 py-2 text-white font-body-md text-center focus:outline-none focus:border-primary-container" defaultValue="10,000đ" /></div>
            </div>
          </div>
        </div>
      )}
      {/* Branch Management */}
      {/* Branch Management */}
      {(activeTab === 'Thông tin chung' || activeTab === 'Chi nhánh') && (
        <div className="bg-surface-container rounded-xl border border-slate-700/50 p-6 animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-h2 text-white">Quản lý chi nhánh</h2>
            <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-4 py-2 bg-primary-container text-on-primary-container rounded-lg font-label-caps hover:bg-primary transition-colors"><span className="material-symbols-outlined text-[16px]">add</span>Thêm CN</button>
          </div>
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-700/50 text-slate-400 font-label-caps">
                <th className="py-3 px-4">Mã</th><th className="py-3 px-4">Tên</th><th className="py-3 px-4">Địa chỉ</th><th className="py-3 px-4">Thao tác</th>
              </tr>
            </thead>
            <tbody className="font-body-md divide-y divide-slate-800/50">
              {branches.map(b => (
                <tr key={b.id}>
                  <td className="py-3 px-4 text-primary-container">{b.id}</td>
                  <td className="py-3 px-4 text-white">{b.name}</td>
                  <td className="py-3 px-4 text-slate-300">{b.address}</td>
                  <td className="py-3 px-4 flex gap-2">
                    <button onClick={() => handleOpenModal(b)} className="px-3 py-1 bg-surface-secondary border border-border-subtle rounded-lg text-slate-300 hover:text-primary-container hover:border-primary-container transition-colors font-label-caps">Sửa</button>
                    <button onClick={() => handleDeleteBranch(b.id)} className="px-3 py-1 bg-status-occupied/10 border border-status-occupied/20 rounded-lg text-status-occupied hover:bg-status-occupied hover:text-white transition-colors font-label-caps">Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Placeholders for other tabs */}
      {activeTab === 'Bảng giá' && (
        <div className="bg-surface-container rounded-xl border border-slate-700/50 p-6 animate-fade-in">
          <p className="text-slate-400">Cấu hình bảng giá theo khung giờ sẽ được cập nhật ở phiên bản sau.</p>
        </div>
      )}
      {activeTab === 'Khác' && (
        <div className="bg-surface-container rounded-xl border border-slate-700/50 p-6 animate-fade-in">
          <p className="text-slate-400">Các cấu hình hệ thống khác...</p>
        </div>
      )}

      <div className="pt-4">
        <button onClick={handleSaveConfig} className="px-8 py-3 bg-primary-container text-on-primary-container rounded-lg font-body-md font-semibold hover:bg-primary transition-colors shadow-lg shadow-primary-container/20">Lưu cấu hình</button>
      </div>

      {/* Branch Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-container border border-slate-700/50 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-h2 text-white">{editingBranch ? 'Cập Nhật Chi Nhánh' : 'Thêm Chi Nhánh Mới'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-slate-400 font-body-md mb-2">Tên Chi Nhánh</label>
                <input
                  value={branchForm.name}
                  onChange={e => setBranchForm({ ...branchForm, name: e.target.value })}
                  className="w-full bg-surface-secondary border border-border-subtle rounded-lg px-4 py-2.5 text-white font-body-md focus:outline-none focus:border-primary-container"
                  placeholder="VD: CN Quận 1"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-body-md mb-2">Địa Chỉ</label>
                <input
                  value={branchForm.address}
                  onChange={e => setBranchForm({ ...branchForm, address: e.target.value })}
                  className="w-full bg-surface-secondary border border-border-subtle rounded-lg px-4 py-2.5 text-white font-body-md focus:outline-none focus:border-primary-container"
                  placeholder="VD: 123 Lê Lợi..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 border border-slate-700/50 text-slate-300 rounded-lg font-body-md hover:bg-surface-secondary transition-colors">Hủy</button>
              <button onClick={handleSaveBranch} className="px-6 py-2.5 bg-primary-container text-on-primary-container rounded-lg font-body-md font-semibold hover:bg-primary transition-colors">Lưu Thông Tin</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
