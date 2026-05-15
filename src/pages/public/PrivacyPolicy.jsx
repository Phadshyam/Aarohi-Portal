// src/pages/public/PrivacyPolicy.jsx
import React from 'react'

export default function PrivacyPolicy() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Privacy Policy</h1>
        
        <div className="prose prose-slate max-w-none">
          <p className="text-sm text-slate-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>
          
          <p>
            Welcome to Aarohi Multiservices. We value your privacy and are committed to protecting your personal data. 
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website 
            or use our services.
          </p>

          <h2 className="text-xl font-bold mt-8 mb-4">1. Information We Collect</h2>
          <p>
            We may collect personal identification information such as your name, mobile number, email address, 
            and other details relevant to the government documentation services you request. We also collect non-personal 
            data like browser types, device information, and site usage statistics.
          </p>

          <h2 className="text-xl font-bold mt-8 mb-4">2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Provide, operate, and maintain our services</li>
            <li>Process your applications and deliver updates</li>
            <li>Improve, personalize, and expand our website</li>
            <li>Understand and analyze how you use our website</li>
            <li>Communicate with you for customer service and support</li>
          </ul>

          <h2 className="text-xl font-bold mt-8 mb-4">3. Data Security</h2>
          <p>
            We use administrative, technical, and physical security measures to help protect your personal information. 
            While we have taken reasonable steps to secure the personal information you provide to us, please be aware that 
            no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
          </p>

          <h2 className="text-xl font-bold mt-8 mb-4">4. Third-Party Services</h2>
          <p>
            We may use third-party service providers to monitor and analyze the use of our Service, or to process payments. 
            These third parties have access to your Personal Data only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.
          </p>

          <h2 className="text-xl font-bold mt-8 mb-4">5. Important Disclaimer</h2>
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 my-4">
            <p className="font-semibold text-amber-800 m-0">
              Aarohi Multiservices is a private service provider and consultant. We are NOT a government entity, 
              nor are we officially affiliated with any government department or agency. We simply assist citizens 
              in applying for various government documents and services for a consulting fee.
            </p>
          </div>

          <h2 className="text-xl font-bold mt-8 mb-4">6. Contact Us</h2>
          <p>
            If you have questions or comments about this Privacy Policy, please contact us at our registered office or via our official contact numbers provided on this website.
          </p>
        </div>
      </div>
    </div>
  )
}
