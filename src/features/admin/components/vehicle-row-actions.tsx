"use client";

import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { deleteVehicleAction } from "@/features/admin/actions/catalog";

export function VehicleRowActions({ id, name, canDelete }: { id: string; name: string; canDelete: boolean }) {
  return (
    <span className="row-actions"><Link href={`/admin/cars/${id}/edit`} aria-label={`Chỉnh sửa ${name}`}><Pencil size={15} /></Link>{canDelete && <form action={deleteVehicleAction.bind(null, id)} onSubmit={(event) => { if (!confirm(`Xóa xe ${name}? Thao tác này không thể hoàn tác.`)) event.preventDefault(); }}><button className="danger" type="submit" aria-label={`Xóa ${name}`}><Trash2 size={15} /></button></form>}</span>
  );
}
