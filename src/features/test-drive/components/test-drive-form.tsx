"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  createTestDrive,
  type TestDriveActionState,
} from "@/features/test-drive/actions/create-test-drive";

const initialState: TestDriveActionState = { ok: false, message: "" };

interface TestDriveFormProps {
  vehicles: Array<{ id: string; label: string }>;
  showrooms: Array<{ id: string; name: string }>;
  initialVehicleId?: string;
}

function toDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function TestDriveForm({
  vehicles,
  showrooms,
  initialVehicleId,
}: TestDriveFormProps) {
  const [state, action, pending] = useActionState(
    createTestDrive,
    initialState,
  );
  const [submissionKey, setSubmissionKey] = useState("");
  const [landingPage, setLandingPage] = useState("");

  useEffect(() => {
    setSubmissionKey(crypto.randomUUID());
    setLandingPage(window.location.href);
  }, []);

  useEffect(() => {
    if (state.ok) setSubmissionKey(crypto.randomUUID());
  }, [state.ok]);

  const { minDate, maxDate } = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const max = new Date();
    max.setDate(max.getDate() + 90);
    return { minDate: toDateInput(tomorrow), maxDate: toDateInput(max) };
  }, []);

  return (
    <form action={action} className="lead-inline-form test-drive-form">
      <input type="hidden" name="source" value="test-drive-page" />
      <input type="hidden" name="submissionKey" value={submissionKey} />
      <input type="hidden" name="landingPage" value={landingPage} />
      <input type="hidden" name="website" value="" />
      <div className="lead-inline-form__fields">
        <label>
          <span>Họ và tên *</span>
          <input name="name" autoComplete="name" required />
          {state.fieldErrors?.name?.[0] && (
            <small className="field-error">{state.fieldErrors.name[0]}</small>
          )}
        </label>
        <label>
          <span>Số điện thoại *</span>
          <input name="phone" inputMode="tel" autoComplete="tel" required />
          {state.fieldErrors?.phone?.[0] && (
            <small className="field-error">{state.fieldErrors.phone[0]}</small>
          )}
        </label>
        <label>
          <span>Email</span>
          <input name="email" type="email" autoComplete="email" />
        </label>
        <label>
          <span>Xe muốn lái thử *</span>
          <select
            name="variantId"
            defaultValue={initialVehicleId ?? ""}
            required
          >
            <option value="" disabled>
              Chọn mẫu xe
            </option>
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Showroom *</span>
          <select name="showroomId" defaultValue="" required>
            <option value="" disabled>
              Chọn showroom
            </option>
            {showrooms.map((showroom) => (
              <option key={showroom.id} value={showroom.id}>
                {showroom.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Ngày lái thử *</span>
          <input name="date" type="date" min={minDate} max={maxDate} required />
        </label>
        <label>
          <span>Giờ mong muốn *</span>
          <input
            name="time"
            type="time"
            min="08:00"
            max="18:00"
            step="1800"
            required
          />
        </label>
        <label className="lead-inline-form__note">
          <span>Ghi chú</span>
          <textarea
            name="note"
            rows={3}
            placeholder="Yêu cầu hoặc thông tin cần chuẩn bị..."
          />
        </label>
      </div>

      <label className="lead-inline-form__consent">
        <input type="checkbox" name="consent" required />
        <span>
          Tôi đồng ý để AURELIA liên hệ xác nhận lịch và xử lý thông tin theo
          chính sách bảo mật.
        </span>
      </label>
      {state.message && (
        <p className={state.ok ? "form-success" : "form-error"} role="status">
          {state.message}
        </p>
      )}

      <Button type="submit" size="lg" disabled={pending || !submissionKey}>
        {pending ? "Đang đặt lịch..." : "Đặt lịch lái thử"}
      </Button>
    </form>
  );
}
