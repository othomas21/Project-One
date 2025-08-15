# 🏥 Curie Radiology Platform

<div align="center">
  <img src="public/curie-logo.png" alt="Curie Logo" width="120" height="120">
  
  [![Next.js](https://img.shields.io/badge/Next.js-14.1.0-black?logo=next.js)](https://nextjs.org)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue?logo=typescript)](https://typescriptlang.org)
  [![Supabase](https://img.shields.io/badge/Supabase-Latest-green?logo=supabase)](https://supabase.com)
  [![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-Latest-000?logo=shadcnui)](https://ui.shadcn.com)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
</div>

<p align="center">
  <strong>Complete HIPAA-compliant medical imaging platform for healthcare professionals</strong><br>
  Professional medical image search, upload, and viewing with secure DICOM support
</p>

---

## ✨ Production-Ready Features

### 🔍 **Advanced Medical Image Search**
- 🏥 Professional radiology search with medical filters (CT, MRI, X-Ray, Ultrasound)
- 🔎 Real-time database search with Supabase integration
- 📊 Visual results grid with medical image thumbnails
- 🎯 Filter by modality, anatomy, date range, patient ID, and study description

### 📤 **Secure DICOM Upload System**
- 🩺 Professional drag-and-drop medical image upload
- 📱 Support for DICOM files and standard medical images
- 📋 Automatic metadata extraction and validation
- ⚡ Real-time upload progress with error handling

### 🖼️ **Professional Medical Image Viewer**
- 🔬 Medical-grade image viewer with zoom, pan, and rotation
- ⌨️ Full keyboard shortcuts for professional workflow
- 📏 Professional controls suitable for radiology review
- 🖥️ Fullscreen mode with metadata display

### 🔐 **HIPAA-Compliant Security**
- 🛡️ Row-Level Security (RLS) policies for patient data protection
- 🏢 Institution-based data isolation for multi-tenant support
- 🔒 Encrypted file storage in private Supabase buckets
- 📋 Complete audit logging for compliance tracking

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Supabase account
- Vercel account (for deployment)

### 1. Clone and Install
```bash
git clone <your-repo-url>
cd curie-radiology-platform
npm install
```

### 2. Database Setup
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to **SQL Editor**
3. Copy and execute `scripts/minimal-schema.sql`
4. Copy and execute `supabase/storage-setup.sql`

### 3. Environment Configuration
Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Run Development Server
```bash
npm run dev
# Visit http://localhost:3000
```

### 5. Deploy to Production
```bash
npm run build
npx vercel --prod
```

## 🧪 Testing

Run the comprehensive platform test:
```bash
node scripts/test-platform.js
```

## 📚 Documentation

- **[Complete Deployment Guide](./DEPLOYMENT_GUIDE.md)** - Detailed setup instructions
- **[Component Documentation](./src/components/features/)** - UI component details
- **[Database Schema](./scripts/minimal-schema.sql)** - Complete database structure

## 🏗️ Architecture

```
📦 Curie Radiology Platform
├── 🎨 Frontend (Next.js 14 + shadcn/ui)
│   ├── Advanced Search Interface
│   ├── Visual Results Grid  
│   ├── Professional Image Viewer
│   └── Secure Upload Interface
├── 🗄️ Backend (Supabase)
│   ├── PostgreSQL with Medical Schema
│   ├── Storage Buckets (encrypted)
│   ├── Row-Level Security Policies
│   └── Real-time Subscriptions
└── 🔐 Security
    ├── HIPAA-Compliant Data Handling
    ├── Institution-Based Access Control
    └── Complete Audit Logging
```

## 🎯 Core Components

### Search System (`/search`)
- **SearchFilters**: Advanced medical image filters
- **SearchResultsGrid**: Visual thumbnail grid with hover effects
- **MedicalImageViewer**: Professional image viewer with zoom/pan/rotate

### Upload System (`/upload`)
- **MedicalImageUploader**: Drag-and-drop DICOM interface
- **Progress Tracking**: Real-time upload progress
- **Metadata Management**: Automatic DICOM metadata extraction

### Security & Compliance
- **HIPAA-Compliant Storage** with Row-Level Security policies
- **Institution-Based Data Isolation** for multi-tenant support
- **Encrypted File Storage** in private Supabase buckets
- **Audit Logging** for compliance tracking

## 🎯 Production Readiness

### ✅ Completed Features
- [x] Medical image search with professional filters
- [x] DICOM file upload with metadata extraction
- [x] Visual search results with thumbnail grid
- [x] Professional medical image viewer
- [x] HIPAA-compliant security and storage
- [x] Responsive design for all devices
- [x] Real-time database integration
- [x] TypeScript with full type safety
- [x] Modern UI/UX with accessibility
- [x] Performance optimization and error handling

### 🚀 Ready for Medical Professionals

The platform is **production-ready** and can handle real-world medical imaging workflows immediately after database setup.

**For Radiologists:**
- Professional image viewer with medical-grade controls
- Study navigation and metadata display
- DICOM-compliant image handling

**For Technologists:**
- Batch DICOM upload interface
- Quality control and metadata validation
- Progress tracking and error handling

**For IT Administrators:**
- HIPAA compliance built-in
- Role-based access control ready
- Complete audit logging and monitoring

## 🎉 Next Steps

1. **Apply Database Migrations** (5 minutes)
   - Execute `scripts/minimal-schema.sql` in Supabase
   - Execute `supabase/storage-setup.sql` in Supabase

2. **Deploy to Production** (5 minutes)
   - Run `npm run build && npx vercel --prod`

3. **Test with Real Data**
   - Upload DICOM files
   - Test search and viewing functionality

## 📞 Support

- **Technical Documentation**: Comprehensive inline code docs
- **Deployment Guide**: `DEPLOYMENT_GUIDE.md`
- **Testing Scripts**: `scripts/test-platform.js`
- **Database Setup**: `scripts/minimal-schema.sql`

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## ⚠️ Medical Disclaimer

**This platform is for medical professional use only.** Always ensure proper patient consent and data anonymization. Consult healthcare compliance officers for institutional deployment.

## 🙏 Acknowledgments

- **[Supabase](https://supabase.com)** - Backend-as-a-Service platform
- **[shadcn/ui](https://ui.shadcn.com)** - Beautiful UI components
- **[Next.js](https://nextjs.org)** - React framework
- **Medical professionals** - For guidance on professional workflows

---

*Built with ❤️ using Next.js 14, Supabase, and shadcn/ui - Ready for medical professionals worldwide*