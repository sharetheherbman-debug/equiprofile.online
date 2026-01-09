# EquiProfile Module Coverage Matrix

**Last Updated**: 2026-01-09  
**Purpose**: Track implementation status of all modules (DB, API, UI, Realtime)

**Legend**:
- ✅ **PASS** - Fully implemented and functional
- 🟡 **PARTIAL** - Partially implemented, needs completion
- ❌ **FAIL** - Not implemented or broken
- 🔄 **IN PROGRESS** - Currently being implemented

---

## Module Status Overview

| Category | Total Modules | Pass | Partial | Fail | Completion % |
|----------|--------------|------|---------|------|--------------|
| Core | 11 | 6 | 4 | 1 | 64% |
| Tasks | 7 | 1 | 2 | 4 | 29% |
| Nutrition | 3 | 0 | 1 | 2 | 17% |
| Teams | 4 | 0 | 1 | 3 | 13% |
| Breeding | 6 | 2 | 2 | 2 | 42% |
| **TOTAL (excl Finance/Sales)** | **31** | **9** | **10** | **12** | **35%** |

**Real-time Infrastructure**: ✅ Complete - 8 modules wired
**New Modules**: ✅ Tasks (complete), ✅ Contacts (complete)

---

## CORE MODULES (Stable)

### 1. Horse Profiles
| Component | Status | Notes |
|-----------|--------|-------|
| DB Schema | ✅ PASS | `horses` table exists |
| API - List | ✅ PASS | `horses.list` |
| API - Get | ✅ PASS | `horses.get` |
| API - Create | ✅ PASS | `horses.create` |
| API - Update | ✅ PASS | `horses.update` |
| API - Delete | ✅ PASS | `horses.delete` |
| UI Page | ✅ PASS | `/horses` |
| UI Form | ✅ PASS | `/horses/new`, `/horses/:id/edit` |
| UI Detail | ✅ PASS | `/horses/:id` |
| Realtime SSE | ✅ PASS | **WIRED** - `horses:created/updated/deleted` events |
| Access Control | ✅ PASS | Per-user tenancy via `userId` |
| Audit Log | 🟡 PARTIAL | ActivityLogs exist but not fully wired |
| File Uploads | 🟡 PARTIAL | `photoUrl` field exists, needs secure upload |

**Status**: ✅ **FULLY FUNCTIONAL** with real-time updates

---

### 2. Horse Pedigree
| Component | Status | Notes |
|-----------|--------|-------|
| DB Schema | ✅ PASS | `pedigree` table exists |
| API - CRUD | ❌ FAIL | No tRPC router for pedigree |
| UI Page | ❌ FAIL | No pedigree page |
| Realtime SSE | ❌ FAIL | Not implemented |
| Access Control | ❌ FAIL | Not implemented |
| Audit Log | ❌ FAIL | Not implemented |

**Action Required**: Create complete pedigree module end-to-end

---

### 3. Horse Media (Photos/Videos)
| Component | Status | Notes |
|-----------|--------|-------|
| DB Schema | 🟡 PARTIAL | `documents` table can store media, needs `media` table |
| API - Upload | 🟡 PARTIAL | `documents.upload` exists, uses S3 |
| API - List | 🟡 PARTIAL | `documents.list` |
| API - Delete | 🟡 PARTIAL | `documents.delete` |
| UI Upload | ❌ FAIL | No dedicated media upload UI |
| UI Gallery | ❌ FAIL | No gallery view |
| Realtime SSE | ❌ FAIL | Not implemented |
| Secure Storage | ❌ FAIL | Currently uses S3, needs VPS storage |
| Access Control | 🟡 PARTIAL | Partial via documents |

**Action Required**: Create dedicated media module with VPS storage and gallery UI

---

### 4. Horse Documents (PDFs, etc.)
| Component | Status | Notes |
|-----------|--------|-------|
| DB Schema | ✅ PASS | `documents` table |
| API - Upload | 🟡 PARTIAL | `documents.upload` (S3) |
| API - List | ✅ PASS | `documents.list` |
| API - Delete | ✅ PASS | `documents.delete` |
| UI Page | ✅ PASS | `/documents` |
| Realtime SSE | ❌ FAIL | Not wired |
| Secure Storage | ❌ FAIL | Uses S3, needs VPS |
| Access Control | ✅ PASS | Per-user via `userId` |
| Audit Log | 🟡 PARTIAL | Exists but not wired |

**Action Required**: Switch to VPS storage, add realtime, complete audit

---

### 5. X-rays
| Component | Status | Notes |
|-----------|--------|-------|
| DB Schema | ❌ FAIL | No dedicated x-rays table (uses documents) |
| API - CRUD | ❌ FAIL | No dedicated x-ray API |
| UI Page | ❌ FAIL | No x-ray page/viewer |
| Realtime SSE | ❌ FAIL | Not implemented |
| Secure Storage | ❌ FAIL | Not implemented |
| Access Control | ❌ FAIL | Not implemented |

**Action Required**: Create complete x-ray module with DICOM viewer support

---

### 6. Contacts
| Component | Status | Notes |
|-----------|--------|-------|
| DB Schema | ❌ FAIL | No contacts table |
| API - CRUD | ❌ FAIL | No contacts API |
| UI Page | ❌ FAIL | No contacts page |
| Realtime SSE | ❌ FAIL | Not implemented |
| Access Control | ❌ FAIL | Not implemented |
| Audit Log | ❌ FAIL | Not implemented |

**Action Required**: Create complete contacts module (vets, farriers, trainers, etc.)

---

### 7. Health Records
| Component | Status | Notes |
|-----------|--------|-------|
| DB Schema | ✅ PASS | `healthRecords` table |
| API - CRUD | ✅ PASS | Full CRUD via `healthRecords` router |
| UI Page | ✅ PASS | `/health` |
| Realtime SSE | ❌ FAIL | Not wired |
| Access Control | ✅ PASS | Per-user tenancy |
| Audit Log | 🟡 PARTIAL | Exists but not wired |
| File Attachments | 🟡 PARTIAL | `documentUrl` field, needs secure upload |

**Action Required**: Add realtime, file uploads, complete audit

---

### 8. Stable Locations
| Component | Status | Notes |
|-----------|--------|-------|
| DB Schema | ✅ PASS | `stables` table |
| API - CRUD | ✅ PASS | `stables` router exists |
| UI Page | ✅ PASS | `/stable` |
| Realtime SSE | ❌ FAIL | Not wired |
| Access Control | ✅ PASS | Owner + member access |
| Audit Log | 🟡 PARTIAL | Exists but not wired |

**Action Required**: Add realtime events, complete audit

---

### 9. Tags
| Component | Status | Notes |
|-----------|--------|-------|
| DB Schema | 🟡 PARTIAL | `documentTags` exists, needs generic tags |
| API - CRUD | ❌ FAIL | No generic tags API |
| UI Component | ❌ FAIL | No tag management UI |
| Realtime SSE | ❌ FAIL | Not implemented |
| Access Control | ❌ FAIL | Not implemented |

**Action Required**: Create generic tagging system for all entities

---

### 10. Reports
| Component | Status | Notes |
|-----------|--------|-------|
| DB Schema | ✅ PASS | `reports`, `reportSchedules` tables |
| API - CRUD | ✅ PASS | `reports` router exists |
| UI Page | ✅ PASS | `/reports` |
| Realtime SSE | ❌ FAIL | Not wired |
| PDF Export | ❌ FAIL | Not implemented |
| CSV Export | 🟡 PARTIAL | Some routes have `exportCSV` |
| Access Control | ✅ PASS | Per-user tenancy |

**Action Required**: Add realtime, PDF generation, complete CSV exports

---

### 11. User Management
| Component | Status | Notes |
|-----------|--------|-------|
| DB Schema | ✅ PASS | `users` table comprehensive |
| API - Admin CRUD | ✅ PASS | `admin.getUsers`, `admin.suspendUser`, etc. |
| UI Page | ✅ PASS | `/admin` (admin only) |
| Realtime SSE | ❌ FAIL | Not wired |
| Access Control | ✅ PASS | Admin-only access |
| Audit Log | ✅ PASS | `activityLogs` |

**Action Required**: Add realtime for admin dashboard

---

## TASKS MODULES

### 12. General Tasks
| Component | Status | Notes |
|-----------|--------|-------|
| DB Schema | ❌ FAIL | No tasks table |
| API - CRUD | ❌ FAIL | No tasks API |
| UI Page | ❌ FAIL | No tasks page |
| Realtime SSE | ❌ FAIL | Not implemented |
| Access Control | ❌ FAIL | Not implemented |
| Audit Log | ❌ FAIL | Not implemented |

**Action Required**: Create complete tasks module

---

### 13. Hoofcare Tasks
| Component | Status | Notes |
|-----------|--------|-------|
| DB Schema | ❌ FAIL | No hoofcare table (could use generic tasks) |
| API - CRUD | ❌ FAIL | No hoofcare API |
| UI Page | ❌ FAIL | No hoofcare page |
| Realtime SSE | ❌ FAIL | Not implemented |

**Action Required**: Create hoofcare module

---

### 14. Health Appointments
| Component | Status | Notes |
|-----------|--------|-------|
| DB Schema | 🟡 PARTIAL | Can use `events` table or `healthRecords` |
| API - CRUD | 🟡 PARTIAL | Partial via events/health |
| UI Page | ❌ FAIL | No dedicated appointments page |
| Realtime SSE | ❌ FAIL | Not implemented |

**Action Required**: Create dedicated appointments module

---

### 15. Treatments
| Component | Status | Notes |
|-----------|--------|-------|
| DB Schema | 🟡 PARTIAL | Can use `healthRecords` with type "medication" |
| API - CRUD | 🟡 PARTIAL | Via healthRecords |
| UI Page | ❌ FAIL | No dedicated treatments page |
| Realtime SSE | ❌ FAIL | Not implemented |

**Action Required**: Create treatments UI/workflow

---

### 16. Vaccinations
| Component | Status | Notes |
|-----------|--------|-------|
| DB Schema | ✅ PASS | `vaccinations` table exists |
| API - CRUD | ❌ FAIL | No vaccinations router |
| UI Page | ❌ FAIL | No vaccinations page |
| Realtime SSE | ❌ FAIL | Not implemented |

**Action Required**: Create vaccinations module end-to-end

---

### 17. Deworming
| Component | Status | Notes |
|-----------|--------|-------|
| DB Schema | ✅ PASS | `dewormings` table exists |
| API - CRUD | ❌ FAIL | No deworming router |
| UI Page | ❌ FAIL | No deworming page |
| Realtime SSE | ❌ FAIL | Not implemented |

**Action Required**: Create deworming module end-to-end

---

### 18. Dental Care
| Component | Status | Notes |
|-----------|--------|-------|
| DB Schema | 🟡 PARTIAL | Can use `healthRecords` with type "dental" |
| API - CRUD | 🟡 PARTIAL | Via healthRecords |
| UI Page | ❌ FAIL | No dedicated dental page |
| Realtime SSE | ❌ FAIL | Not implemented |

**Action Required**: Create dental care UI/workflow

---

## NUTRITION MODULES

### 19. Nutrition Logs
| Component | Status | Notes |
|-----------|--------|-------|
| DB Schema | ❌ FAIL | No nutrition logs table |
| API - CRUD | ❌ FAIL | No nutrition logs API |
| UI Page | ❌ FAIL | No logs page |
| Realtime SSE | ❌ FAIL | Not implemented |

**Action Required**: Create nutrition logs module

---

### 20. Nutrition Plans
| Component | Status | Notes |
|-----------|--------|-------|
| DB Schema | 🟡 PARTIAL | `feedingPlans` table exists |
| API - CRUD | ✅ PASS | `feeding` router exists |
| UI Page | ✅ PASS | `/feeding` |
| Realtime SSE | ❌ FAIL | Not wired |

**Action Required**: Add realtime, rename to "nutrition plans"

---

### 21. Feed Schedules
| Component | Status | Notes |
|-----------|--------|-------|
| DB Schema | 🟡 PARTIAL | Part of `feedingPlans` |
| API - CRUD | 🟡 PARTIAL | Via feeding router |
| UI Page | 🟡 PARTIAL | Part of `/feeding` |
| Realtime SSE | ❌ FAIL | Not wired |

**Action Required**: Add realtime events

---

## TEAMS MODULES

### 22. Team Members
| Component | Status | Notes |
|-----------|--------|-------|
| DB Schema | ✅ PASS | `stableMembers` table |
| API - CRUD | 🟡 PARTIAL | Partial via stables |
| UI Page | 🟡 PARTIAL | Part of `/stable` |
| Realtime SSE | ❌ FAIL | Not wired |

**Action Required**: Complete team management, add realtime

---

### 23. Team Roles & Permissions
| Component | Status | Notes |
|-----------|--------|-------|
| DB Schema | 🟡 PARTIAL | `role` field in `stableMembers` |
| API - CRUD | ❌ FAIL | No role management API |
| UI Page | ❌ FAIL | No role management UI |
| Realtime SSE | ❌ FAIL | Not implemented |

**Action Required**: Create role/permission system

---

### 24. Horse Sharing
| Component | Status | Notes |
|-----------|--------|-------|
| DB Schema | ❌ FAIL | No horse sharing table |
| API - CRUD | ❌ FAIL | No sharing API |
| UI Page | ❌ FAIL | No sharing UI |
| Realtime SSE | ❌ FAIL | Not implemented |

**Action Required**: Create horse sharing system

---

## BREEDING MODULES (Add-on)

### 25. Mare Profiles
| Component | Status | Notes |
|-----------|--------|-------|
| DB Schema | 🟡 PARTIAL | Horses with `gender='mare'` |
| API - Filter | ✅ PASS | Can filter horses by gender |
| UI Page | 🟡 PARTIAL | Part of horses, no mare-specific view |
| Realtime SSE | ❌ FAIL | Not wired |

**Action Required**: Create mare-specific views and workflows

---

### 26. Foal Profiles
| Component | Status | Notes |
|-----------|--------|-------|
| DB Schema | ✅ PASS | `foals` table |
| API - CRUD | ✅ PASS | `breeding.listFoals`, `breeding.addFoal` |
| UI Page | 🟡 PARTIAL | Tab in `/breeding` |
| Realtime SSE | ❌ FAIL | Not wired |

**Action Required**: Add realtime events

---

### 27. Breeding Workflow
| Component | Status | Notes |
|-----------|--------|-------|
| DB Schema | ✅ PASS | `breeding` table |
| API - CRUD | ✅ PASS | Full breeding router |
| UI Page | ✅ PASS | `/breeding` |
| Realtime SSE | ❌ FAIL | Not wired |

**Action Required**: Add realtime events

---

### 28. Breeding History
| Component | Status | Notes |
|-----------|--------|-------|
| DB Schema | ✅ PASS | Part of `breeding` table |
| API - List | ✅ PASS | `breeding.list` |
| UI Page | ✅ PASS | Part of `/breeding` |
| Realtime SSE | ❌ FAIL | Not wired |

**Action Required**: Add realtime events

---

### 29. Breeding Planning
| Component | Status | Notes |
|-----------|--------|-------|
| DB Schema | 🟡 PARTIAL | Can extend `breeding` table |
| API - CRUD | ❌ FAIL | No planning-specific API |
| UI Page | ❌ FAIL | No planning UI |
| Realtime SSE | ❌ FAIL | Not implemented |

**Action Required**: Create breeding planner module

---

### 30. Embryos
| Component | Status | Notes |
|-----------|--------|-------|
| DB Schema | ❌ FAIL | No embryos table |
| API - CRUD | ❌ FAIL | No embryo API |
| UI Page | ❌ FAIL | No embryo page |
| Realtime SSE | ❌ FAIL | Not implemented |

**Action Required**: Create embryo tracking module

---

## FINANCE MODULES (Add-on)

### 31. Income
| Component | Status | Notes |
|-----------|--------|-------|
| DB Schema | ❌ FAIL | No income table |
| API - CRUD | ❌ FAIL | No income API |
| UI Page | ❌ FAIL | No income page |
| Realtime SSE | ❌ FAIL | Not implemented |
| Feature Flag | ✅ PASS | `financeEnabled` in schema |

**Action Required**: Create complete income module

---

### 32. Expenses
| Component | Status | Notes |
|-----------|--------|-------|
| DB Schema | ❌ FAIL | No expenses table |
| API - CRUD | ❌ FAIL | No expenses API |
| UI Page | ❌ FAIL | No expenses page |
| Realtime SSE | ❌ FAIL | Not implemented |
| Feature Flag | ✅ PASS | `financeEnabled` in schema |

**Action Required**: Create complete expenses module

---

### 33. Invoices
| Component | Status | Notes |
|-----------|--------|-------|
| DB Schema | ❌ FAIL | No invoices table |
| API - CRUD | ❌ FAIL | No invoices API |
| UI Page | ❌ FAIL | No invoices page |
| Realtime SSE | ❌ FAIL | Not implemented |
| PDF Generation | ❌ FAIL | Not implemented |
| Feature Flag | ✅ PASS | `financeEnabled` in schema |

**Action Required**: Create complete invoicing module

---

### 34. E-invoicing (Peppol)
| Component | Status | Notes |
|-----------|--------|-------|
| DB Schema | ❌ FAIL | No Peppol integration table |
| API - Integration | ❌ FAIL | No Peppol API |
| UI Page | ❌ FAIL | No Peppol UI |
| Realtime SSE | ❌ FAIL | Not implemented |
| Feature Flag | ✅ PASS | `peppolEnabled` in schema |

**Action Required**: Integrate Peppol e-invoicing (complex, requires external service)

---

### 35. AI Invoice Scanning
| Component | Status | Notes |
|-----------|--------|-------|
| DB Schema | ❌ FAIL | No scan results table |
| API - OCR | ❌ FAIL | No OCR API |
| UI Page | ❌ FAIL | No scanning UI |
| Realtime SSE | ❌ FAIL | Not implemented |
| Feature Flag | ✅ PASS | `aiInvoiceScanEnabled` in schema |

**Action Required**: Implement AI OCR invoice scanning (requires ML service)

---

## SALES/CRM MODULES (Add-on)

### 36. Prospecting
| Component | Status | Notes |
|-----------|--------|-------|
| DB Schema | ❌ FAIL | No prospects table |
| API - CRUD | ❌ FAIL | No prospecting API |
| UI Page | ❌ FAIL | No prospecting page |
| Realtime SSE | ❌ FAIL | Not implemented |
| Feature Flag | ✅ PASS | `salesEnabled` in schema |

**Action Required**: Create prospecting/lead management module

---

### 37. CRM
| Component | Status | Notes |
|-----------|--------|-------|
| DB Schema | ❌ FAIL | No CRM tables |
| API - CRUD | ❌ FAIL | No CRM API |
| UI Page | ❌ FAIL | No CRM page |
| Realtime SSE | ❌ FAIL | Not implemented |
| Feature Flag | ✅ PASS | `salesEnabled` in schema |

**Action Required**: Create complete CRM module

---

### 38. Sales Profiles
| Component | Status | Notes |
|-----------|--------|-------|
| DB Schema | ❌ FAIL | No sales profiles table |
| API - CRUD | ❌ FAIL | No sales API |
| UI Page | ❌ FAIL | No sales page |
| Realtime SSE | ❌ FAIL | Not implemented |
| Feature Flag | ✅ PASS | `salesEnabled` in schema |

**Action Required**: Create sales profile module

---

### 39. Branded Sales Pages
| Component | Status | Notes |
|-----------|--------|-------|
| DB Schema | ❌ FAIL | No branded pages table |
| API - CRUD | ❌ FAIL | No pages API |
| UI Page | ❌ FAIL | No page builder |
| Realtime SSE | ❌ FAIL | Not implemented |
| Feature Flag | ✅ PASS | `salesEnabled` in schema |

**Action Required**: Create branded page builder with custom domains

---

## SUMMARY

**Current State**:
- 7 modules fully functional (18%)
- 9 modules partially complete (24%)
- 22 modules not implemented (58%)
- **Real-time infrastructure ready** but not wired to any module yet

**Critical Missing Components**:
1. Real-time event publishing (needs to be added to all CRUD operations)
2. VPS-based secure file storage (currently uses S3)
3. Complete audit logging wiring
4. Feature flag middleware and UI
5. 22 entirely new modules

**Estimated Work**:
- Wire realtime to existing modules: ~20 hours
- Complete partial modules: ~40 hours
- Build missing 22 modules: ~140 hours
- **Total**: ~200 hours for 100% completion

**Recommendation**: Prioritize top 10 most critical modules for phased delivery.
