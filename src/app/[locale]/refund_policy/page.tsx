"use client";

import PolicyPage, { PolicyDocument, PolicyKey } from "@/components/policies/PolicyPage";

const refundDocuments: Record<PolicyKey, PolicyDocument> = {
  en: {
    label: "US",
    title: "Read Refund Policy",
    company: "IPHINT / UTRBOX Inc.",
    effectiveDate: "Effective Date: April 5, 2026",
    lang: "en",
    sections: [
      {
        id: "general",
        title: "1. General Policy",
        paragraphs: [
          "All payments made for the IPHINT service (the \"Service\") are non-refundable, except as expressly stated in this Policy or as required by applicable law.",
          "By purchasing or subscribing to the Service, you acknowledge and agree to this Refund Policy.",
        ],
      },
      {
        id: "subscription",
        title: "2. Subscription Fees",
        paragraphs: ["If you purchase a subscription:"],
        list: [
          "Fees are billed in advance on a recurring basis (monthly or annually).",
          "Payments are non-refundable once charged.",
          "You may cancel your subscription at any time, but cancellation will only take effect at the end of the current billing cycle.",
          "No refunds or credits will be provided for partial periods, unused features, or inactivity.",
        ],
      },
      {
        id: "one-time",
        title: "3. One-Time Purchases",
        paragraphs: [
          "All one-time purchases, including credits, add-ons, or premium features, are final and non-refundable once the transaction is completed.",
        ],
      },
      {
        id: "free-trials",
        title: "4. Free Trials",
        paragraphs: ["If a free trial is offered:"],
        list: [
          "You must cancel before the trial period ends to avoid being charged.",
          "Once a paid subscription begins, it is non-refundable.",
          "Failure to cancel before billing constitutes authorization of the charge.",
        ],
      },
      {
        id: "billing-errors",
        title: "5. Billing Errors",
        paragraphs: [
          "If you believe you have been charged in error, you must contact us within 7 days of the charge.",
          "If we determine that an error occurred, we may issue a refund or credit at our sole discretion.",
        ],
      },
      {
        id: "exceptional",
        title: "6. Exceptional Circumstances",
        paragraphs: ["We may, at our sole discretion, provide refunds in exceptional cases, including:"],
        list: [
          "Duplicate payments",
          "Technical failures that prevent access to the Service",
          "Other circumstances deemed appropriate by the Company",
        ],
        footerParagraphs: ["Such refunds are not guaranteed and are handled case-by-case."],
      },
      {
        id: "chargebacks",
        title: "7. Chargebacks and Disputes",
        paragraphs: ["If you initiate a chargeback or payment dispute:"],
        list: [
          "We reserve the right to suspend or terminate your account immediately.",
          "You remain responsible for any outstanding amounts.",
          "We may dispute the chargeback with supporting evidence.",
          "Abusive or repeated chargebacks may result in permanent account restriction.",
        ],
      },
      {
        id: "availability",
        title: "8. Service Availability",
        paragraphs: ["Refunds will not be issued for:"],
        list: [
          "Temporary service interruptions",
          "Performance issues that do not materially prevent use",
          "Changes to features or functionality",
        ],
        footerParagraphs: ["The Service is provided on an \"as available\" basis."],
      },
      {
        id: "legal",
        title: "9. Legal Compliance",
        paragraphs: [
          "Nothing in this Policy limits your rights under applicable consumer protection laws, including the California Consumer Privacy Act where applicable.",
          "Where required by law, refunds will be provided in accordance with statutory obligations.",
        ],
      },
      {
        id: "modifications",
        title: "10. Modifications",
        paragraphs: [
          "We reserve the right to modify this Refund Policy at any time.",
          "Changes will apply to purchases made after the updated policy becomes effective.",
        ],
      },
    ],
    support: {
      id: "contact",
      navLabel: "Customer Support",
      title: "Customer Support & Inquiries",
      description: "If you have questions regarding this Refund Policy or billing, please reach out:",
      details: [
        { label: "Email", value: "team.iphint@gmail.com", href: "mailto:team.iphint@gmail.com" },
        { label: "Customer Center", value: "02-1644-0395" },
        {
          label: "Address",
          value:
            "UTRBOX 20, Solmae-ro 7ga-gil, Gangbuk-gu, Seoul (1F), Postal Code: 01207, Republic of Korea (South Korea)",
        },
      ],
    },
  },
  ko: {
    label: "한국어",
    title: "환불 정책 읽기",
    company: "아이피힌트(IPHINT) / UTRBOX Inc.",
    effectiveDate: "시행일: 2026년 4월 5일",
    lang: "ko",
    sections: [
      {
        id: "general",
        title: "제1조 (일반 정책)",
        paragraphs: [
          "IPHINT 서비스(이하 \"서비스\")에 대해 이루어진 모든 결제는 본 정책에서 명시적으로 정한 경우 또는 관련 법령상 요구되는 경우를 제외하고 환불되지 않습니다.",
          "이용자는 서비스를 구매하거나 구독함으로써 본 환불 정책에 동의한 것으로 간주됩니다.",
        ],
      },
      {
        id: "subscription",
        title: "제2조 (구독 요금)",
        paragraphs: ["이용자가 구독 상품을 구매하는 경우 다음이 적용됩니다."],
        list: [
          "요금은 월간 또는 연간 기준으로 선불 청구됩니다.",
          "청구가 완료된 결제는 환불되지 않습니다.",
          "이용자는 언제든지 구독을 해지할 수 있으나, 해지는 현재 청구 주기가 종료된 후에 효력이 발생합니다.",
          "부분 기간, 미사용 기능 또는 비활성 상태에 대한 환불이나 크레딧은 제공되지 않습니다.",
        ],
      },
      {
        id: "one-time",
        title: "제3조 (일회성 구매)",
        paragraphs: [
          "크레딧, 부가 기능 또는 프리미엄 기능을 포함한 모든 일회성 구매는 거래가 완료된 시점부터 최종적이며 환불되지 않습니다.",
        ],
      },
      {
        id: "free-trials",
        title: "제4조 (무료 체험)",
        paragraphs: ["무료 체험이 제공되는 경우 다음이 적용됩니다."],
        list: [
          "과금 방지를 위해 체험 기간 종료 전에 해지해야 합니다.",
          "유료 구독이 시작된 이후에는 환불되지 않습니다.",
          "과금 전에 해지하지 않은 경우 해당 청구에 동의한 것으로 간주됩니다.",
        ],
      },
      {
        id: "billing-errors",
        title: "제5조 (청구 오류)",
        paragraphs: [
          "청구 오류가 있다고 판단되는 경우, 결제일로부터 7일 이내에 회사에 연락해야 합니다.",
          "회사가 실제 오류를 확인한 경우 회사의 단독 재량으로 환불 또는 크레딧을 제공할 수 있습니다.",
        ],
      },
      {
        id: "exceptional",
        title: "제6조 (예외적 상황)",
        paragraphs: ["회사는 다음과 같은 예외적인 경우에 한하여 단독 재량으로 환불을 제공할 수 있습니다."],
        list: [
          "중복 결제",
          "서비스 접근을 불가능하게 하는 기술적 장애",
          "그 밖에 회사가 적절하다고 판단하는 사유",
        ],
        footerParagraphs: ["이러한 환불은 보장되지 않으며, 개별 사안별로 판단됩니다."],
      },
      {
        id: "chargebacks",
        title: "제7조 (차지백 및 결제 분쟁)",
        paragraphs: ["이용자가 차지백 또는 결제 분쟁을 제기하는 경우 다음이 적용됩니다."],
        list: [
          "회사는 즉시 계정을 정지하거나 해지할 수 있습니다.",
          "이용자는 미지급 금액에 대해 계속 책임을 부담합니다.",
          "회사는 관련 증빙자료를 바탕으로 차지백에 이의를 제기할 수 있습니다.",
          "악의적이거나 반복적인 차지백은 계정의 영구 제한으로 이어질 수 있습니다.",
        ],
      },
      {
        id: "availability",
        title: "제8조 (서비스 제공 상태)",
        paragraphs: ["다음과 같은 사유에 대해서는 환불이 제공되지 않습니다."],
        list: [
          "일시적인 서비스 중단",
          "사용 자체를 본질적으로 막지 않는 성능 문제",
          "기능 또는 서비스 구성의 변경",
        ],
        footerParagraphs: ["서비스는 \"제공 가능한 상태\"를 기준으로 제공됩니다."],
      },
      {
        id: "legal",
        title: "제9조 (법률 준수)",
        paragraphs: [
          "본 정책은 관련 소비자 보호법상 이용자의 권리를 제한하지 않으며, 필요한 경우 California Consumer Privacy Act를 포함한 관련 법령이 우선 적용됩니다.",
          "법률상 요구되는 경우 환불은 해당 법적 의무에 따라 제공됩니다.",
        ],
      },
      {
        id: "modifications",
        title: "제10조 (정책 변경)",
        paragraphs: [
          "회사는 언제든지 본 환불 정책을 변경할 수 있습니다.",
          "변경된 정책은 효력 발생 이후 이루어진 구매에 적용됩니다.",
        ],
      },
    ],
    support: {
      id: "contact",
      navLabel: "고객 지원 및 문의",
      title: "고객 지원 및 문의",
      description: "본 환불 정책 또는 결제와 관련한 문의는 아래로 연락해 주세요.",
      details: [
        { label: "이메일", value: "team.iphint@gmail.com", href: "mailto:team.iphint@gmail.com" },
        { label: "고객센터", value: "02-1644-0395" },
        { label: "주소", value: "UTRBOX, 서울특별시 강북구 솔매로 7가길 20 (1F), 우편번호 01207, 대한민국" },
      ],
    },
  },
};

export default function RefundPolicy() {
  return <PolicyPage pageTitles={{ en: "Refund Policy", ko: "환불 정책" }} documents={refundDocuments} />;
}