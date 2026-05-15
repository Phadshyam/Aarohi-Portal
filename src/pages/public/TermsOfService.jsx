// src/pages/public/TermsOfService.jsx
import React from 'react'

export default function TermsOfService() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Terms of Service</h1>
        
        <div className="prose prose-slate max-w-none">
          <p className="text-sm text-slate-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-xl font-bold mt-8 mb-4">1. Agreement to Terms</h2>
          <p>
            By accessing or using our website and services, you agree to be bound by these Terms of Service. 
            If you disagree with any part of the terms, then you do not have permission to access the Service.
          </p>

          <h2 className="text-xl font-bold mt-8 mb-4">2. Service Description and Disclaimer</h2>
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 my-4">
            <p className="font-semibold text-amber-800 m-0">
              IMPORTANT: Aarohi Multiservices is a PRIVATE consultancy service. We are NOT a government body, 
              agency, or affiliate. We act solely as consultants or facilitators to assist individuals in preparing, 
              submitting, and tracking their applications for various government documents and services.
            </p>
          </div>
          <p>
            Our fees are consulting charges for our time, effort, and expertise, and are entirely separate from any official government fees.
          </p>

          <h2 className="text-xl font-bold mt-8 mb-4">3. User Responsibilities</h2>
          <p>You agree to:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Provide accurate, complete, and true information.</li>
            <li>Submit authentic supporting documents as required for your application.</li>
            <li>Understand that the final decision regarding the issuance of any government document rests entirely with the respective government authority. We do not guarantee approval.</li>
          </ul>

          <h2 className="text-xl font-bold mt-8 mb-4">4. Processing Times</h2>
          <p>
            Any processing timelines provided by us are estimates based on standard government procedures. 
            We are not responsible for delays caused by government departments, holidays, strikes, or technical issues on government portals.
          </p>

          <h2 className="text-xl font-bold mt-8 mb-4">5. Limitation of Liability</h2>
          <p>
            Aarohi Multiservices shall not be liable for any indirect, incidental, special, consequential, or punitive damages, 
            including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from 
            your access to or use of or inability to access or use the Service; or any conduct or content of any third party on the Service.
          </p>

          <h2 className="text-xl font-bold mt-8 mb-4">6. Changes</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. 
            What constitutes a material change will be determined at our sole discretion.
          </p>
        </div>
      </div>
    </div>
  )
}
