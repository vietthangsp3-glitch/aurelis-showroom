import { VehicleForm } from "@/features/admin/components/vehicle-form";
import { requireRole } from "@/lib/auth/session";
export default async function NewCarPage() { await requireRole(["ADMIN", "EDITOR"]); return <div className="admin-page"><div className="admin-title"><div><p className="admin-breadcrumb">Quản lý xe / Thêm xe</p><h1>Thêm xe mới</h1></div></div><VehicleForm /></div>; }
