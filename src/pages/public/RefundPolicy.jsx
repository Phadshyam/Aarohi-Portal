// src/pages/public/RefundPolicy.jsx
import React from 'react'

export default function RefundPolicy() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Cancellation & Refund Policy</h1>
        
        <div className="prose prose-slate max-w-none">
          <p className="text-sm text-slate-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-xl font-bold mt-8 mb-4">1. General Policy</h2>
          <p>
            At Aarohi Multiservices, we strive to provide excellent consulting services for your documentation needs. 
            Because our services involve immediate consultation, document verification, and processing effort, our 
            refund policy is structured accordingly.
          </p>

          <h2 className="text-xl font-bold mt-8 mb-4">2. Eligibility for Refund</h2>
          <p>Refunds may be considered under the following circumstances:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>
              <strong>Before Processing:</strong> If you cancel your application before we have initiated any work or submitted it to the relevant department, you are eligible for a full refund minus any payment gateway charges.
            </li>
            <li>
              <strong>Duplicate Payment:</strong> If you have accidentally made a payment twice for the same application.
            </li>
          </ul>

          <h2 className="text-xl font-bold mt-8 mb-4">3. Non-Refundable Situations</h2>
          <p>We do NOT provide refunds in the following scenarios:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Once the application has been submitted to the respective government portal or authority.</li>
            <li>If your application is rejected by the government authority due to incorrect information, forged documents, or ineligibility.</li>
            <li>If you fail to provide the required documents within a reasonable timeframe.</li>
            <li>Government fees/challans paid on your behalf are strictly non-refundable under any circumstances.</li>
          </ul>

          <h2 className="text-xl font-bold mt-8 mb-4">4. Refund Process</h2>
          <p>
            To request a refund, please contact our support team with your Application ID and reason for cancellation. 
            Approved refunds will be processed within 5-7 business days and credited back to the original method of payment.
          </p>

          <h2 className="text-xl font-bold mt-8 mb-4">5. Disclaimer</h2>
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 my-4">
            <p className="font-semibold text-amber-800 m-0">
              Aarohi Multiservices is a private consultancy. We do not guarantee the approval of any application, 
              as that is solely the jurisdiction of the issuing government authority. Our fee is for the preparation 
              and submission of your application only.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
