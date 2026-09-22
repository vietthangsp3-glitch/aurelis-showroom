import { VehicleForm } from "@/features/admin/components/vehicle-form";
import { requireRole } from "@/lib/auth/session";
export default async function EditCarPage() { await requireRole(["ADMIN", "EDITOR"]); return <div className="admin-page"><div className="admin-title"><div><p className="admin-breadcrumb">Quản lý xe / Chỉnh sửa</p><h1>Chỉnh sửa thông tin xe</h1></div></div><VehicleForm /></div>; }
