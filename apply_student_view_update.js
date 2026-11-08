const fs = require('fs');
const filePath = 'bookworm-library/src/components/dashboard/StudentManagementView.tsx';
let code = fs.readFileSync(filePath, 'utf8');

// 1. Replace top imports
const oldImport = `import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Modal,
  useWindowDimensions,
} from 'react-native';`;

const newImport = `import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Modal,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';`;

code = code.replace(oldImport, newImport);

// Replace icons to include Edit2, Edit3, Power, RefreshCw
const oldIcons = `  Smartphone,
} from 'lucide-react-native';`;

const newIcons = `  Smartphone,
  Edit2,
  Edit3,
  Power,
  RefreshCw,
  UserX,
} from 'lucide-react-native';
import {
  studentService,
  EnrolledStudent,
  StudentCategory,
  StudentShift,
  RenewalStatus,
  SentNotification,
} from '@/services/student-service';
import { useAuth } from '@/context/AuthContext';
import { AddStudentModal } from '@/components/dashboard/AddStudentModal';

export type { StudentCategory, StudentShift, RenewalStatus, SentNotification, EnrolledStudent };`;

code = code.replace(oldIcons, newIcons);

// 2. Remove INITIAL_STUDENTS and replace with empty state & service
const typeStart = `export type StudentCategory = 'exclusive' | 'premium' | 'classic';`;
const initialStudentsEnd = `notificationsSent: [],
  },
];`;

const idx1 = code.indexOf(typeStart);
const idx2 = code.indexOf(initialStudentsEnd);

if (idx1 !== -1 && idx2 !== -1) {
  code = code.slice(0, idx1) + code.slice(idx2 + initialStudentsEnd.length);
} else {
  console.error('Could not find INITIAL_STUDENTS markers');
  process.exit(1);
}

// 3. Update component state and hooks
const oldStateMarker = `  // State
  const [studentsList, setStudentsList] = useState<EnrolledStudent[]>(INITIAL_STUDENTS);`;

const newState = `  const { adminProfile } = useAuth();
  const libraryId = adminProfile?.library_id;

  // Real Supabase State
  const [studentsList, setStudentsList] = useState<EnrolledStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Edit Student Modal State
  const [studentToEdit, setStudentToEdit] = useState<EnrolledStudent | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editPincode, setEditPincode] = useState('');
  const [editSeatNumber, setEditSeatNumber] = useState('');
  const [editShift, setEditShift] = useState('morning');
  const [editAmount, setEditAmount] = useState('2000');
  const [editPaymentMode, setEditPaymentMode] = useState('UPI');
  const [editGuardianName, setEditGuardianName] = useState('');
  const [editGuardianPhone, setEditGuardianPhone] = useState('');
  const [editTargetExam, setEditTargetExam] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editStatus, setEditStatus] = useState<'active' | 'inactive' | 'suspended'>('active');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editErrorMessage, setEditErrorMessage] = useState<string | null>(null);

  // Deactivate Confirmation State
  const [studentToDeactivate, setStudentToDeactivate] = useState<EnrolledStudent | null>(null);
  const [isDeactivating, setIsDeactivating] = useState(false);

  // Internal Add Student Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const loadStudents = useCallback(async (showRefreshing = false) => {
    if (!libraryId) {
      setIsLoading(false);
      return;
    }
    if (showRefreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setFetchError(null);

    try {
      const result = await studentService.getStudents(libraryId);
      if (result.success && result.data) {
        setStudentsList(result.data);
      } else {
        setFetchError(result.error || 'Failed to load students from database.');
      }
    } catch (err: any) {
      setFetchError(err?.message || 'Error connecting to database.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [libraryId]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const handleOpenEdit = (student: EnrolledStudent) => {
    setStudentToEdit(student);
    setEditFullName(student.name);
    setEditPhone(student.phone);
    setEditEmail(student.email);
    setEditAddress(student.address);
    setEditCity(student.city || 'Prayagraj');
    setEditPincode(student.pincode || '211001');
    setEditSeatNumber(student.seatNumber);
    setEditShift(student.shift);
    setEditAmount(String(student.amountPaid));
    setEditPaymentMode(student.paymentMode || 'UPI');
    setEditGuardianName(student.guardianName || '');
    setEditGuardianPhone(student.guardianPhone || '');
    setEditTargetExam(student.targetExam || '');
    setEditNotes(student.notes || '');
    setEditStatus(student.status || 'active');
    setEditErrorMessage(null);
  };

  const handleSaveEdit = async () => {
    if (!libraryId || !studentToEdit) return;
    const trimmedName = editFullName.trim();
    const trimmedPhone = editPhone.trim();
    if (!trimmedName || trimmedName.length < 2) {
      setEditErrorMessage('Full Name is required (minimum 2 characters).');
      return;
    }
    if (!trimmedPhone || trimmedPhone.replace(/\\D/g, '').length < 10) {
      setEditErrorMessage('Valid 10-digit phone number is required.');
      return;
    }

    setIsSavingEdit(true);
    setEditErrorMessage(null);
    try {
      const result = await studentService.updateStudent(libraryId, studentToEdit.dbId, {
        fullName: trimmedName,
        phone: trimmedPhone,
        email: editEmail.trim(),
        address: editAddress.trim(),
        city: editCity.trim(),
        pincode: editPincode.trim(),
        seatNumber: editSeatNumber.trim().toUpperCase(),
        shift: editShift,
        amountPaid: Number(editAmount) || studentToEdit.amountPaid,
        paymentMode: editPaymentMode,
        guardianName: editGuardianName.trim(),
        guardianPhone: editGuardianPhone.trim(),
        targetExam: editTargetExam.trim(),
        notes: editNotes.trim(),
        status: editStatus,
      });

      if (!result.success || !result.data) {
        setEditErrorMessage(result.error || 'Failed to update student.');
        setIsSavingEdit(false);
        return;
      }

      setStudentsList((prev) =>
        prev.map((s) => (s.dbId === studentToEdit.dbId ? result.data! : s))
      );
      if (selectedStudentForProfile?.dbId === studentToEdit.dbId) {
        setSelectedStudentForProfile(result.data);
      }
      setStudentToEdit(null);
      setActionFeedback({
        type: 'success',
        message: \`Student details for \${result.data.name} updated successfully in Supabase!\`,
      });
      setTimeout(() => setActionFeedback(null), 3500);
    } catch (err: any) {
      setEditErrorMessage(err?.message || 'Error saving changes.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleConfirmDeactivate = async () => {
    if (!libraryId || !studentToDeactivate) return;
    setIsDeactivating(true);
    try {
      const result = await studentService.deactivateStudent(libraryId, studentToDeactivate.dbId);
      if (result.success) {
        setStudentsList((prev) =>
          prev.map((s) => (s.dbId === studentToDeactivate.dbId ? { ...s, status: 'inactive' } : s))
        );
        if (selectedStudentForProfile?.dbId === studentToDeactivate.dbId) {
          setSelectedStudentForProfile((prev) => prev ? { ...prev, status: 'inactive' } : null);
        }
        setActionFeedback({
          type: 'success',
          message: \`\${studentToDeactivate.name} has been deactivated. Allocated seat has been freed.\`,
        });
        setStudentToDeactivate(null);
        setTimeout(() => setActionFeedback(null), 3500);
      } else {
        setActionFeedback({
          type: 'error',
          message: result.error || 'Failed to deactivate student.',
        });
      }
    } catch (err: any) {
      setActionFeedback({
        type: 'error',
        message: err?.message || 'Error during deactivation.',
      });
    } finally {
      setIsDeactivating(false);
    }
  };

  const handleReactivate = async (student: EnrolledStudent) => {
    if (!libraryId) return;
    try {
      const result = await studentService.reactivateStudent(libraryId, student.dbId);
      if (result.success) {
        setStudentsList((prev) =>
          prev.map((s) => (s.dbId === student.dbId ? { ...s, status: 'active' } : s))
        );
        if (selectedStudentForProfile?.dbId === student.dbId) {
          setSelectedStudentForProfile((prev) => prev ? { ...prev, status: 'active' } : null);
        }
        setActionFeedback({
          type: 'success',
          message: \`\${student.name} reactivated successfully.\`,
        });
        setTimeout(() => setActionFeedback(null), 3500);
      }
    } catch (err: any) {
      setActionFeedback({ type: 'error', message: err?.message || 'Failed to reactivate.' });
    }
  };

  const handleStudentEnrolled = (newStudent: EnrolledStudent) => {
    setStudentsList((prev) => [newStudent, ...prev]);
    setActionFeedback({
      type: 'success',
      message: \`Student \${newStudent.name} (\${newStudent.id}) enrolled successfully in Supabase!\`,
    });
    setTimeout(() => setActionFeedback(null), 4000);
  };`;

code = code.replace(oldStateMarker, newState);

// 4. Update the "Enroll New Student" button in the header to support either onOpenAddStudent or internal modal
const oldEnrollBtn = `<TouchableOpacity
              onPress={onOpenAddStudent}`;

const newEnrollBtn = `<TouchableOpacity
              onPress={onOpenAddStudent || (() => setIsAddModalOpen(true))}`;

code = code.replace(oldEnrollBtn, newEnrollBtn);

// 5. Add actionFeedback and fetchError banners right before section 2 (metrics row)
const metricsMarker = `{/* ========================================================================= */}
      {/* 2. STATS KPI METRICS ROW                                                  */}`;

const feedbackBanner = `{/* Real-time Feedback & Refresh Banners */}
      {actionFeedback && (
        <View
          style={[
            styles.feedbackBanner,
            {
              backgroundColor: actionFeedback.type === 'success'
                ? (isDark ? '#203A2D' : '#E8F5EE')
                : (isDark ? '#3D2020' : '#FDECE8'),
              borderColor: actionFeedback.type === 'success'
                ? (isDark ? '#55B58D' : '#287A5B')
                : '#C76B59',
            },
          ]}>
          <CheckCircle2 size={16} color={actionFeedback.type === 'success' ? '#287A5B' : '#C76B59'} />
          <Text
            style={[
              styles.feedbackBannerText,
              { color: actionFeedback.type === 'success' ? (isDark ? '#7FD1AC' : '#245C48') : '#C76B59' },
            ]}>
            {actionFeedback.message}
          </Text>
          <TouchableOpacity onPress={() => setActionFeedback(null)}>
            <X size={14} color={colors.text.muted} />
          </TouchableOpacity>
        </View>
      )}

      {fetchError && (
        <View style={[styles.errorBannerBox, { backgroundColor: isDark ? '#3D2020' : '#FDECE8', borderColor: '#C76B59' }]}>
          <AlertCircle size={18} color="#C76B59" />
          <Text style={styles.errorBannerText}>{fetchError}</Text>
          <TouchableOpacity onPress={() => loadStudents(true)} style={[styles.retryBtn, { backgroundColor: isDark ? '#245C48' : '#287A5B' }]}>
            <RefreshCw size={13} color="#FFFFFF" />
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      `;

code = code.replace(metricsMarker, feedbackBanner + metricsMarker);

// 6. Update section 4 to handle isLoading and empty database
const oldSection4Marker = `{/* ========================================================================= */}
      {/* 4. STUDENT RECORDS DIRECTORY                                              */}
      {/* ========================================================================= */}
      {filteredStudents.length === 0 ? (`;

const newSection4 = `{/* ========================================================================= */}
      {/* 4. STUDENT RECORDS DIRECTORY                                              */}
      {/* ========================================================================= */}
      {isLoading ? (
        <View
          style={[
            styles.emptyStateCard,
            {
              backgroundColor: isDark ? colors.surface.card : '#FFFFFF',
              borderColor: colors.surface.border,
              paddingVertical: 50,
            },
          ]}>
          <ActivityIndicator size="large" color={isDark ? colors.brand.primary : '#287A5B'} />
          <Text style={[styles.emptyTitle, { color: colors.text.primary, marginTop: 14 }]}>
            Loading Students from Supabase...
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.text.muted }]}>
            Fetching authenticated library student records, seats, and subscriptions.
          </Text>
        </View>
      ) : filteredStudents.length === 0 ? (
        <View
          style={[
            styles.emptyStateCard,
            {
              backgroundColor: isDark ? colors.surface.card : '#FFFFFF',
              borderColor: colors.surface.border,
            },
          ]}>
          <Users size={40} color={colors.text.muted} strokeWidth={1.5} />
          <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>
            {studentsList.length === 0 ? 'No Students Enrolled Yet' : 'No Enrolled Students Found'}
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.text.muted }]}>
            {studentsList.length === 0
              ? 'Enroll your first student to allocate desks, assign shifts, and manage subscriptions.'
              : 'No students match your filter criteria or search query.'}
          </Text>
          {studentsList.length === 0 ? (
            <TouchableOpacity
              onPress={onOpenAddStudent || (() => setIsAddModalOpen(true))}
              style={[styles.resetFiltersBtn, { backgroundColor: isDark ? '#245C48' : '#287A5B' }]}>
              <Plus size={14} color="#FFFFFF" />
              <Text style={styles.resetFiltersBtnText}>Enroll First Student</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedShift('all');
                setSelectedRenewalStatus('all');
              }}
              style={[styles.resetFiltersBtn, { backgroundColor: '#245C48' }]}>
              <RotateCcw size={14} color="#FFFFFF" />
              <Text style={styles.resetFiltersBtnText}>Reset All Filters</Text>
            </TouchableOpacity>
          )}`;

// Find and replace section 4 start
const s4idx = code.indexOf(oldSection4Marker);
if (s4idx !== -1) {
  // Find where the resetFiltersBtn ends
  const s4endMarker = `</TouchableOpacity>
        </View>`;
  const s4end = code.indexOf(s4endMarker, s4idx);
  code = code.slice(0, s4idx) + newSection4 + code.slice(s4end);
}

// 7. Add Edit button on Cards View (next to Full Profile)
const oldCardFooter = `<TouchableOpacity
                    onPress={() => setSelectedStudentForProfile(student)}
                    style={[
                      styles.viewProfileBtn,
                      {
                        backgroundColor: isDark ? colors.surface.canvas : '#F8F8F5',
                        borderColor: colors.surface.border,
                      },
                    ]}
                    activeOpacity={0.8}>
                    <Eye size={13} color={colors.text.secondary} />
                    <Text style={[styles.viewProfileBtnText, { color: colors.text.secondary }]}>
                      Full Profile
                    </Text>
                  </TouchableOpacity>`;

const newCardFooter = `<TouchableOpacity
                    onPress={() => handleOpenEdit(student)}
                    style={[
                      styles.editCardBtn,
                      {
                        backgroundColor: isDark ? colors.surface.canvas : '#F8F8F5',
                        borderColor: colors.surface.border,
                      },
                    ]}
                    activeOpacity={0.8}>
                    <Edit3 size={13} color={colors.text.secondary} />
                    <Text style={[styles.viewProfileBtnText, { color: colors.text.secondary }]}>
                      Edit
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setSelectedStudentForProfile(student)}
                    style={[
                      styles.viewProfileBtn,
                      {
                        backgroundColor: isDark ? colors.surface.canvas : '#F8F8F5',
                        borderColor: colors.surface.border,
                      },
                    ]}
                    activeOpacity={0.8}>
                    <Eye size={13} color={colors.text.secondary} />
                    <Text style={[styles.viewProfileBtnText, { color: colors.text.secondary }]}>
                      Full Profile
                    </Text>
                  </TouchableOpacity>`;

code = code.replace(oldCardFooter, newCardFooter);

// 8. Add Edit button in Table View actions
const oldTableActions = `<TouchableOpacity
                        onPress={() => setSelectedStudentForProfile(student)}
                        style={[
                          styles.tableActionTextBtn,
                          {
                            backgroundColor: isDark ? colors.surface.canvas : '#F8F8F5',
                            borderColor: colors.surface.border,
                          },
                        ]}>
                        <Eye size={12} color={colors.text.secondary} />
                        <Text style={[styles.tableActionTextBtnLabel, { color: colors.text.secondary }]}>
                          Details
                        </Text>
                      </TouchableOpacity>`;

const newTableActions = `<TouchableOpacity
                        onPress={() => handleOpenEdit(student)}
                        style={[
                          styles.tableActionIconBtn,
                          {
                            backgroundColor: isDark ? colors.surface.canvas : '#F8F8F5',
                            borderColor: colors.surface.border,
                            borderWidth: 1,
                          },
                        ]}
                        accessibilityLabel="Edit Student">
                        <Edit3 size={13} color={colors.text.secondary} />
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => setSelectedStudentForProfile(student)}
                        style={[
                          styles.tableActionTextBtn,
                          {
                            backgroundColor: isDark ? colors.surface.canvas : '#F8F8F5',
                            borderColor: colors.surface.border,
                          },
                        ]}>
                        <Eye size={12} color={colors.text.secondary} />
                        <Text style={[styles.tableActionTextBtnLabel, { color: colors.text.secondary }]}>
                          Details
                        </Text>
                      </TouchableOpacity>`;

code = code.replace(oldTableActions, newTableActions);

// 9. Add Edit & Deactivate buttons in Full Profile modal
const oldProfileHeaderClose = `<TouchableOpacity
                    onPress={() => setSelectedStudentForProfile(null)}
                    style={[styles.closeModalBtn, { backgroundColor: isDark ? colors.surface.cardAlt : '#F1F4EE' }]}>
                    <X size={17} color={colors.text.muted} />
                  </TouchableOpacity>`;

const newProfileHeaderClose = `<View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <TouchableOpacity
                      onPress={() => {
                        const s = selectedStudentForProfile;
                        setSelectedStudentForProfile(null);
                        handleOpenEdit(s);
                      }}
                      style={[styles.headerEditBtn, { backgroundColor: isDark ? '#245C48' : '#287A5B' }]}>
                      <Edit3 size={14} color="#FFFFFF" />
                      <Text style={styles.headerEditBtnText}>Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => setSelectedStudentForProfile(null)}
                      style={[styles.closeModalBtn, { backgroundColor: isDark ? colors.surface.cardAlt : '#F1F4EE' }]}>
                      <X size={17} color={colors.text.muted} />
                    </TouchableOpacity>
                  </View>`;

code = code.replace(oldProfileHeaderClose, newProfileHeaderClose);

// In profile modal footer:
const oldProfileFooter = `<View style={[styles.dialogFooter, { borderTopColor: colors.surface.border }]}>
                  <TouchableOpacity
                    onPress={() => {
                      const stu = selectedStudentForProfile;
                      setSelectedStudentForProfile(null);
                      handleOpenNotify(stu, stu.renewalStatus === 'active' ? 'general' : 'renewal');
                    }}
                    style={[styles.sendNotifBtn, { backgroundColor: isDark ? '#245C48' : '#287A5B' }]}>
                    <Bell size={15} color="#FFFFFF" />
                    <Text style={styles.sendNotifBtnText}>Send Notification to Student</Text>
                  </TouchableOpacity>
                </View>`;

const newProfileFooter = `<View style={[styles.dialogFooter, { borderTopColor: colors.surface.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
                  {selectedStudentForProfile.status === 'inactive' ? (
                    <TouchableOpacity
                      onPress={() => handleReactivate(selectedStudentForProfile)}
                      style={[styles.reactivateActionBtn, { backgroundColor: isDark ? '#245C48' : '#287A5B' }]}>
                      <CheckCircle2 size={14} color="#FFFFFF" />
                      <Text style={styles.actionBtnTextWhite}>Reactivate Student</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      onPress={() => {
                        const s = selectedStudentForProfile;
                        setSelectedStudentForProfile(null);
                        setStudentToDeactivate(s);
                      }}
                      style={[styles.deactivateActionBtn, { backgroundColor: isDark ? '#3D2020' : '#FDECE8', borderColor: '#C76B59' }]}>
                      <Power size={14} color="#C76B59" />
                      <Text style={[styles.deactivateActionBtnText, { color: '#C76B59' }]}>Deactivate Student</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    onPress={() => {
                      const stu = selectedStudentForProfile;
                      setSelectedStudentForProfile(null);
                      handleOpenNotify(stu, stu.renewalStatus === 'active' ? 'general' : 'renewal');
                    }}
                    style={[styles.sendNotifBtn, { backgroundColor: isDark ? '#245C48' : '#287A5B' }]}>
                    <Bell size={15} color="#FFFFFF" />
                    <Text style={styles.sendNotifBtnText}>Send Notification</Text>
                  </TouchableOpacity>
                </View>`;

code = code.replace(oldProfileFooter, newProfileFooter);

// 10. Add the Edit Student Modal and Deactivate Confirmation Modal right before </View> at end of component
const componentEnd = `      </Modal>
    </View>
  );
}`;

const extraModals = `      </Modal>

      {/* ========================================================================= */}
      {/* 7. EDIT STUDENT MODAL                                                     */}
      {/* ========================================================================= */}
      <Modal
        visible={studentToEdit !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setStudentToEdit(null)}>
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.dialogCard,
              {
                backgroundColor: isDark ? colors.surface.card : '#FFFFFF',
                borderColor: colors.surface.border,
                maxWidth: 580,
              },
            ]}>
            <View style={[styles.dialogHeader, { borderBottomColor: colors.surface.border }]}>
              <View style={styles.dialogHeaderLeft}>
                <View style={[styles.dialogIconWrap, { backgroundColor: isDark ? 'rgba(85, 181, 141, 0.16)' : '#E8F5EE' }]}>
                  <Edit3 size={18} color={isDark ? '#55B58D' : '#287A5B'} />
                </View>
                <View>
                  <Text style={[styles.dialogTitle, { color: colors.text.primary }]}>Edit Student Details</Text>
                  <Text style={[styles.dialogSubtitle, { color: colors.text.muted }]}>
                    {studentToEdit?.name} · {studentToEdit?.id}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setStudentToEdit(null)} style={[styles.closeModalBtn, { backgroundColor: isDark ? colors.surface.cardAlt : '#F1F4EE' }]}>
                <X size={17} color={colors.text.muted} />
              </TouchableOpacity>
            </View>

            {editErrorMessage && (
              <View style={[styles.editErrorBanner, { backgroundColor: isDark ? '#3D2020' : '#FDECE8', borderColor: '#C76B59' }]}>
                <AlertCircle size={15} color="#C76B59" />
                <Text style={styles.editErrorText}>{editErrorMessage}</Text>
              </View>
            )}

            <ScrollView contentContainerStyle={styles.editFormContent} showsVerticalScrollIndicator={false}>
              {/* Name & Phone */}
              <View style={styles.editFormRow}>
                <View style={{ flex: 1, gap: 5 }}>
                  <Text style={[styles.fieldLabel, { color: colors.text.secondary }]}>Full Name *</Text>
                  <TextInput
                    value={editFullName}
                    onChangeText={setEditFullName}
                    style={[styles.fieldInput, { backgroundColor: colors.surface.canvas, borderColor: colors.surface.border, color: colors.text.primary }]}
                  />
                </View>
                <View style={{ flex: 1, gap: 5 }}>
                  <Text style={[styles.fieldLabel, { color: colors.text.secondary }]}>Mobile Number *</Text>
                  <TextInput
                    value={editPhone}
                    onChangeText={setEditPhone}
                    keyboardType="phone-pad"
                    style={[styles.fieldInput, { backgroundColor: colors.surface.canvas, borderColor: colors.surface.border, color: colors.text.primary }]}
                  />
                </View>
              </View>

              {/* Email & Permanent Address */}
              <View style={styles.editFormRow}>
                <View style={{ flex: 1, gap: 5 }}>
                  <Text style={[styles.fieldLabel, { color: colors.text.secondary }]}>Email Address</Text>
                  <TextInput
                    value={editEmail}
                    onChangeText={setEditEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={[styles.fieldInput, { backgroundColor: colors.surface.canvas, borderColor: colors.surface.border, color: colors.text.primary }]}
                  />
                </View>
                <View style={{ flex: 1, gap: 5 }}>
                  <Text style={[styles.fieldLabel, { color: colors.text.secondary }]}>Permanent Address</Text>
                  <TextInput
                    value={editAddress}
                    onChangeText={setEditAddress}
                    style={[styles.fieldInput, { backgroundColor: colors.surface.canvas, borderColor: colors.surface.border, color: colors.text.primary }]}
                  />
                </View>
              </View>

              {/* Desk & Shift */}
              <View style={styles.editFormRow}>
                <View style={{ flex: 1, gap: 5 }}>
                  <Text style={[styles.fieldLabel, { color: colors.text.secondary }]}>Desk / Seat Number</Text>
                  <TextInput
                    value={editSeatNumber}
                    onChangeText={setEditSeatNumber}
                    placeholder="e.g. D-01"
                    placeholderTextColor={colors.text.faint}
                    style={[styles.fieldInput, { backgroundColor: colors.surface.canvas, borderColor: colors.surface.border, color: colors.text.primary }]}
                  />
                </View>
                <View style={{ flex: 1, gap: 5 }}>
                  <Text style={[styles.fieldLabel, { color: colors.text.secondary }]}>Study Shift</Text>
                  <View style={styles.shiftPillsRow}>
                    {['morning', 'evening', 'night', 'fullday'].map((s) => (
                      <TouchableOpacity
                        key={s}
                        onPress={() => setEditShift(s)}
                        style={[
                          styles.shiftSelectPill,
                          editShift === s && { backgroundColor: isDark ? '#245C48' : '#287A5B', borderColor: isDark ? '#55B58D' : '#287A5B' },
                        ]}>
                        <Text style={[styles.shiftSelectPillText, { color: editShift === s ? '#FFFFFF' : colors.text.muted }]}>
                          {s.slice(0, 3).toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              {/* Monthly Amount & Payment Mode */}
              <View style={styles.editFormRow}>
                <View style={{ flex: 1, gap: 5 }}>
                  <Text style={[styles.fieldLabel, { color: colors.text.secondary }]}>Monthly Fee (₹)</Text>
                  <TextInput
                    value={editAmount}
                    onChangeText={setEditAmount}
                    keyboardType="numeric"
                    style={[styles.fieldInput, { backgroundColor: colors.surface.canvas, borderColor: colors.surface.border, color: colors.text.primary }]}
                  />
                </View>
                <View style={{ flex: 1, gap: 5 }}>
                  <Text style={[styles.fieldLabel, { color: colors.text.secondary }]}>Status</Text>
                  <View style={styles.shiftPillsRow}>
                    {(['active', 'inactive', 'suspended'] as const).map((st) => (
                      <TouchableOpacity
                        key={st}
                        onPress={() => setEditStatus(st)}
                        style={[
                          styles.shiftSelectPill,
                          editStatus === st && { backgroundColor: isDark ? '#245C48' : '#287A5B', borderColor: isDark ? '#55B58D' : '#287A5B' },
                        ]}>
                        <Text style={[styles.shiftSelectPillText, { color: editStatus === st ? '#FFFFFF' : colors.text.muted }]}>
                          {st.toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              {/* Target Exam & Admin Notes */}
              <View style={{ gap: 5 }}>
                <Text style={[styles.fieldLabel, { color: colors.text.secondary }]}>Target Competitive Exam</Text>
                <TextInput
                  value={editTargetExam}
                  onChangeText={setEditTargetExam}
                  placeholder="e.g. UPSC Civil Services, GATE, SSC CGL"
                  placeholderTextColor={colors.text.faint}
                  style={[styles.fieldInput, { backgroundColor: colors.surface.canvas, borderColor: colors.surface.border, color: colors.text.primary }]}
                />
              </View>

              <View style={{ gap: 5 }}>
                <Text style={[styles.fieldLabel, { color: colors.text.secondary }]}>Admin Notes</Text>
                <TextInput
                  value={editNotes}
                  onChangeText={setEditNotes}
                  multiline
                  numberOfLines={2}
                  style={[styles.fieldInput, { height: 60, backgroundColor: colors.surface.canvas, borderColor: colors.surface.border, color: colors.text.primary }]}
                />
              </View>
            </ScrollView>

            <View style={[styles.dialogFooter, { borderTopColor: colors.surface.border, justifyContent: 'flex-end', gap: 10 }]}>
              <TouchableOpacity onPress={() => setStudentToEdit(null)} style={[styles.cancelEditBtn, { borderColor: colors.surface.border }]}>
                <Text style={[styles.cancelEditBtnText, { color: colors.text.secondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={isSavingEdit}
                onPress={handleSaveEdit}
                style={[styles.saveEditBtn, { backgroundColor: isDark ? '#245C48' : '#287A5B', opacity: isSavingEdit ? 0.7 : 1 }]}>
                {isSavingEdit ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Check size={14} color="#FFFFFF" strokeWidth={2.4} />
                    <Text style={styles.actionBtnTextWhite}>Save Changes</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ========================================================================= */}
      {/* 8. DEACTIVATE CONFIRMATION MODAL                                          */}
      {/* ========================================================================= */}
      <Modal
        visible={studentToDeactivate !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setStudentToDeactivate(null)}>
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.dialogCard,
              {
                backgroundColor: isDark ? colors.surface.card : '#FFFFFF',
                borderColor: colors.surface.border,
                maxWidth: 440,
                padding: 20,
                gap: 16,
              },
            ]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={[styles.deactivateIconCircle, { backgroundColor: isDark ? '#3D2020' : '#FDECE8' }]}>
                <Power size={22} color="#C76B59" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.dialogTitle, { color: colors.text.primary }]}>Deactivate Student?</Text>
                <Text style={[styles.dialogSubtitle, { color: colors.text.muted }]}>
                  {studentToDeactivate?.name} · {studentToDeactivate?.id}
                </Text>
              </View>
            </View>

            <Text style={[styles.deactivateWarningText, { color: colors.text.secondary }]}>
              Deactivating will mark this student as inactive and <Text style={{ fontWeight: '700' }}>vacate Desk {studentToDeactivate?.seatNumber}</Text> so it becomes available for other students.
              All payment and attendance history will be preserved safely.
            </Text>

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10 }}>
              <TouchableOpacity
                disabled={isDeactivating}
                onPress={() => setStudentToDeactivate(null)}
                style={[styles.cancelEditBtn, { borderColor: colors.surface.border }]}>
                <Text style={[styles.cancelEditBtnText, { color: colors.text.secondary }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                disabled={isDeactivating}
                onPress={handleConfirmDeactivate}
                style={[styles.confirmDeactivateBtn, { backgroundColor: '#C76B59', opacity: isDeactivating ? 0.7 : 1 }]}>
                {isDeactivating ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Power size={14} color="#FFFFFF" />
                    <Text style={styles.actionBtnTextWhite}>Confirm Deactivation</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Internal Add Student Modal */}
      <AddStudentModal
        visible={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleStudentEnrolled}
      />
    </View>
  );
}`;

code = code.replace(componentEnd, extraModals);

// 11. Add CSS styles for feedback banner, edit modal, and deactivation
const stylesEnd = `});`;
const extraStyles = `
  feedbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  feedbackBannerText: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '600',
  },
  errorBannerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 12.5,
    color: '#C76B59',
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
  },
  editCardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 7,
    borderWidth: 1,
  },
  headerEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 7,
  },
  headerEditBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  reactivateActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  deactivateActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
  },
  deactivateActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  actionBtnTextWhite: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  editErrorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  editErrorText: {
    color: '#C76B59',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  editFormContent: {
    padding: 16,
    gap: 12,
  },
  editFormRow: {
    flexDirection: 'row',
    gap: 12,
  },
  fieldLabel: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  fieldInput: {
    height: 38,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 12.5,
  },
  shiftPillsRow: {
    flexDirection: 'row',
    gap: 6,
    height: 38,
    alignItems: 'center',
  },
  shiftSelectPill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 34,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  shiftSelectPillText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  cancelEditBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  cancelEditBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  saveEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  deactivateIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deactivateWarningText: {
    fontSize: 13,
    lineHeight: 18,
  },
  confirmDeactivateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
});`;

const lastClose = code.lastIndexOf(stylesEnd);
if (lastClose !== -1) {
  code = code.slice(0, lastClose) + extraStyles;
}

fs.writeFileSync(filePath, code, 'utf8');
console.log('Successfully updated StudentManagementView.tsx');

