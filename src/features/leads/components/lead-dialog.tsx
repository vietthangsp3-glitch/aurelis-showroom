"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import {
  createLead,
  type LeadActionState,
} from "@/features/leads/actions/create-lead";
import { Button } from "@/components/ui/button";
import type { Vehicle } from "@/types/vehicle";

const initialState: LeadActionState = { ok: false, message: "" };

export function LeadDialog({
  vehicle,
  label = "Nhận báo giá",
  variant = "primary",
}: {
  vehicle?: Vehicle;
  label?: string;
  variant?: "primary" | "outline" | "secondary";
}) {
  const [open, setOpen] = useState(false);
  const [submissionKey, setSubmissionKey] = useState("");
  const [state, action, pending] = useActionState(createLead, initialState);
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeButton =
      dialogRef.current?.querySelector<HTMLButtonElement>("button");
    closeButton?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previous?.focus();
    };
  }, [open]);

  const openDialog = () => {
    setSubmissionKey(crypto.randomUUID());
    setOpen(true);
  };

  return (
    <>
      <Button variant={variant} onClick={openDialog}>
        {label} <span aria-hidden="true">→</span>
      </Button>
      {open &&
        typeof document !== "undefined" &&
        createPortal(
        <div
          className="dialog-backdrop"
          role="presentation"
          onMouseDown={() => setOpen(false)}
        >
          <div
            ref={dialogRef}
            className="lead-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="lead-dialog__story">
              <p className="eyebrow">Tư vấn riêng cho bạn</p>
              <h2 id={titleId}>Nhận báo giá & tư vấn nhanh</h2>
              <p>
                Đội ngũ AURELIA sẽ chuẩn bị phương án phù hợp và liên hệ vào
                thời gian bạn chọn.
              </p>
              <div className="lead-dialog__trust">
                <span>Phản hồi trong 24 giờ</span>
                <span>Báo giá minh bạch</span>
                <span>Hỗ trợ toàn quốc</span>
              </div>
            </div>
            <form action={action} className="lead-form">
              <button
                className="dialog-close"
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Đóng"
              >
                <X size={20} />
              </button>
              <input type="hidden" name="carId" value={vehicle?.id ?? ""} />
              <input type="hidden" name="brand" value={vehicle?.brand ?? ""} />
              <input type="hidden" name="source" value="website" />
              <input type="hidden" name="submissionKey" value={submissionKey} />
              <input
                type="hidden"
                name="landingPage"
                value={
                  typeof window === "undefined" ? "" : window.location.href
                }
              />
              <label>
                Họ và tên *
                <input
                  name="name"
                  placeholder="Nhập họ và tên của bạn"
                  autoComplete="name"
                  required
                />
                {state.fieldErrors?.name?.[0] && (
                  <small className="field-error">
                    {state.fieldErrors.name[0]}
                  </small>
                )}
              </label>
              <label>
                Số điện thoại *
                <input
                  name="phone"
                  placeholder="09xx xxx xxx"
                  inputMode="tel"
                  autoComplete="tel"
                  required
                />
                {state.fieldErrors?.phone?.[0] && (
                  <small className="field-error">
                    {state.fieldErrors.phone[0]}
                  </small>
                )}
              </label>
              <label>
                Email
                <input
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </label>
              <div className="form-grid">
                <label>
                  Nhu cầu *
                  <select name="interestType" defaultValue="QUOTE">
                    <option value="QUOTE">Nhận báo giá</option>
                    <option value="FINANCE">Tư vấn trả góp</option>
                    <option value="CAR_SELECTION">Tư vấn chọn xe</option>
                    <option value="PROMOTION">Nhận ưu đãi</option>
                  </select>
                </label>
                <label>
                  Liên hệ lúc *
                  <select name="preferredContactTime" defaultValue="ANYTIME">
                    <option value="ANYTIME">Bất kỳ thời gian nào</option>
                    <option value="MORNING">Buổi sáng</option>
                    <option value="AFTERNOON">Buổi chiều</option>
                    <option value="EVENING">Buổi tối</option>
                  </select>
                </label>
              </div>
              <label>
                Ghi chú
                <textarea
                  name="note"
                  rows={3}
                  placeholder="Điều bạn muốn chuyên viên chuẩn bị trước..."
                />
              </label>
              <label className="honeypot" aria-hidden="true">
                Website
                <input name="website" tabIndex={-1} autoComplete="off" />
              </label>
              <label className="consent">
                <input type="checkbox" name="consent" required />
                <span>
                  Tôi đồng ý để AURELIA liên hệ và xử lý thông tin theo chính
                  sách bảo mật.
                </span>
              </label>
              {state.message && (
                <p
                  className={state.ok ? "form-success" : "form-error"}
                  role="status"
                >
                  {state.message}
                </p>
              )}
              <Button type="submit" size="lg" disabled={pending}>
                {pending ? "Đang gửi..." : "Gửi yêu cầu tư vấn →"}
              </Button>
            </form>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
