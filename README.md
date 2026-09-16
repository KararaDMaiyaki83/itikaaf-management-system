# Federal Republic of Nigeria • Unified National I’tikāf Management Platform
### Powered by GetoCore Digital Innovation

A multi-tenant, cloud-native enterprise web application engineered for the management, screening, biometric/barcode pass verification, and payment gateway revenue-sharing of the annual **I’tikāf (Sunnah of the Last 10 Days of Ramadan)** across all **36 States + Federal Capital Territory (FCT) Abuja** and **774 Local Government Areas (LGAs)** of Nigeria.

---

## Key Features

1. **Nationwide Multi-Tenant Architecture (36 States + FCT Abuja & LGAs)**:
   - Dynamic State-by-State and LGA-by-LGA hierarchy covering all 774 LGAs in Nigeria.
   - Isolated subportals for each subscribing mosque (`/masjid/[slug]`) alongside an all-Nigeria directory.

2. **National Super Admin Command Center (`/super-admin`)**:
   - Onboard new Masaajid with State & cascading LGA selection.
   - Assign local Mosque Administrators with secure role credentials and 4-digit PINs.
   - National Gateway Financial Center: Real-time tracking of Gross Volume, GetoCore Revenue Earned, and Net Mosque Disbursals.
   - Dynamic Commission Engine: Customize platform fee % per mosque (5%, 7.5%, 10%, 15%, or custom).

3. **Configurable Payment Gateway & Automated Revenue Share**:
   - Support for Paystack, Monnify, Flutterwave, and Direct NUBAN Bank Transfer.
   - Dual-split ledger: Automated platform commission credited to GetoCore Digital Innovation Ltd (Jaiz Bank PLC), and net proceeds remitted to the mosque's designated bank account.
   - Flexible Mosque Workflow: Mosque-configurable options for **Screening First (Approval before payment)**, **Pay Upfront**, or **100% Free / Waqf Sponsored**.

4. **Strict Floor Spots Only Policy (No Beds / Mattresses)**:
   - Strict Sunnah floor allocation to maximize space and ensure fairness across all Dārs (Halls).

5. **Printable Gate Pass ID Badge (`/pass`)**:
   - High-resolution SVG barcode and dynamic QR code for gate control.
   - Visual Dār color badges, Ameer leadership badge, verified payment receipt, and anti-counterfeiting security hashes.

6. **Barcode Scanner Headcount & Daily Roll Call (`/admin/headcount`)**:
   - Real-time attendance verification using USB barcode scanners or mobile camera scanners.

7. **Year-Over-Year Returning Mutakif Integration**:
   - One-click auto-fill for returning participants using phone number and National Identification Number (NIN).

---

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS & Lucide React
- **Hosting**: Optimized for Vercel (Edge CDN & Serverless)

---

## Getting Started Locally

```bash
# Clone the repository
git clone <your-repo-url>
cd itikaaf-management-system

# Install dependencies
npm install

# Run the development server
npm run dev

# Or build and launch production server
npm run build
npm run start
```

Open [http://localhost:3033](http://localhost:3033) or [http://localhost:3034](http://localhost:3034) to view the platform.

---

## Production Deployment to Vercel

1. Push this repository to **GitHub**.
2. Visit [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Select your GitHub repository and click **"Deploy"**.
4. The system automatically builds and provides an active HTTPS URL with global CDN acceleration and free SSL.

---

**Developed & Maintained by GetoCore Digital Innovation**  
*Empowering Islamic Institutions across the Federal Republic of Nigeria with World-Class Digital Infrastructure.*
