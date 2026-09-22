"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createLead, type LeadActionState } from "@/features/leads/actions/create-lead";

const initialState: LeadActionState = { ok: false, message: "" };

export function LeadInlineForm() {
  const [state, action, pending] = useActionState(createLead, initialState);
  const [submissionKey, setSubmissionKey] = useState("");
  const [landingPage, setLandingPage] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    setSubmissionKey(crypto.randomUUID());
    setLandingPage(window.location.href);
  }, []);

  useEffect(() => {
    if (!state.ok) return;
    formRef.current?.reset();
    setSubmissionKey(crypto.randomUUID());
  }, [state.ok]);

  return (
    <form ref={formRef} action={action} className="lead-inline-form">
      <div className="lead-inline-form__heading">
        <div>
          <strong>Nhận báo giá nhanh</strong>
          <span>Để lại thông tin, chuyên viên sẽ liên hệ sớm nhất.</span>
        </div>
        <ShieldCheck size={22} aria-hidden="true" />
      </div>

      <input type="hidden" name="interestType" value="QUOTE" />
      <input type="hidden" name="preferredContactTime" value="ANYTIME" />
      <input type="hidden" name="source" value="homepage-cta" />
      <input type="hidden" name="submissionKey" value={submissionKey} />
      <input type="hidden" name="landingPage" value={landingPage} />
      <input type="hidden" name="website" value="" />

      <div className="lead-inline-form__fields">
        <label>
          <span>Tên khách hàng *</span>
          <input name="name" placeholder="Nguyễn Văn An" autoComplete="name" required />
          {state.fieldErrors?.name?.[0] && <small className="field-error">{state.fieldErrors.name[0]}</small>}
        </label>
        <label>
          <span>Số điện thoại *</span>
          <input name="phone" placeholder="09xx xxx xxx" inputMode="tel" autoComplete="tel" required />
          {state.fieldErrors?.phone?.[0] && <small className="field-error">{state.fieldErrors.phone[0]}</small>}
        </label>
        <label className="lead-inline-form__email">
          <span>Email</span>
          <input name="email" type="email" placeholder="you@example.com" autoComplete="email" />
        </label>
      </div>

      <label className="lead-inline-form__consent">
        <input type="checkbox" name="consent" required />
        <span>Tôi đồng ý để AURELIA liên hệ tư vấn và gửi báo giá.</span>
      </label>

      {state.message && (
        <p className={state.ok ? "form-success" : "form-error"} role="status">
          {state.message}
        </p>
      )}

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Đang gửi..." : "Nhận báo giá"} {!pending && <ArrowRight size={17} aria-hidden="true" />}
      </Button>
    </form>
  );
}
