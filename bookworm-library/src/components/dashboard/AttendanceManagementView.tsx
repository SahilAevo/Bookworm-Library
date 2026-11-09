import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { CalendarCheck, QrCode, RefreshCw, Search, ShieldCheck, Users, XCircle } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { useThemeMode } from '@/context/ThemeContext';
import { attendanceService, AttendanceRecord, QRToken } from '@/services/attendance-service';
import { LibXQRCode } from '@/components/common/LibXQRCode';
import { LibraryTenant } from '@/constants/tenants';

interface Props { currentTenant: LibraryTenant; onBackToDashboard?: () => void; onOpenStudentScanner?: () => void }
export function AttendanceManagementView({ currentTenant }: Props) {
  const { adminProfile } = useAuth();
  const { colors, isDark } = useThemeMode();
  const libraryId = adminProfile?.library_id;
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [token, setToken] = useState<QRToken | null>(null);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [query, setQuery] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const refresh = useCallback(async () => {
    if (!libraryId) return;
    setLoading(true); setError('');
    try { setRecords(await attendanceService.getRecords(libraryId, date)); }
    catch (e: any) { setError(e.message || 'Could not load attendance.'); }
    finally { setLoading(false); }
  }, [libraryId, date]);
  useEffect(() => { const timer = setTimeout(() => { void refresh(); }, 0); return () => clearTimeout(timer); }, [refresh]);
  useEffect(() => {
    let mounted = true;
    void attendanceService.issueQR(24).then(value => { if (mounted) setToken(value); }).catch((e: any) => { if (mounted && libraryId) setError(e.message); });
    return () => { mounted = false; };
  }, [libraryId]);

  const inside = records.filter(r => r.status === 'present');
  const filtered = useMemo(() => records.filter(r => `${r.studentName} ${r.studentId} ${r.deskNo}`.toLowerCase().includes(query.toLowerCase())), [records, query]);
  const generateQR = async () => {
    setBusy(true); setError('');
    try { setToken(await attendanceService.issueQR(24)); setNotice('A library QR is active for 24 hours.'); }
    catch (e: any) { setError(e.message); }
    finally { setBusy(false); }
  };
  const revokeQR = async () => {
    setBusy(true);
    try { await attendanceService.revokeQR(); setToken(null); setNotice('The library QR was revoked.'); }
    catch (e: any) { setError(e.message); }
    finally { setBusy(false); }
  };
  const close = async (record: AttendanceRecord) => {
    if (reason.trim().length < 4) { setError('Enter a reason of at least four characters before correcting attendance.'); return; }
    setBusy(true);
    try { await attendanceService.closeVisit(record.id, reason); setReason(''); setNotice(`Checked out ${record.studentName}. Correction recorded in the audit log.`); await refresh(); }
    catch (e: any) { setError(e.message); }
    finally { setBusy(false); }
  };
  const surface = isDark ? colors.surface.card : '#FFFFFF';
  const ink = colors.text.primary;
  const muted = colors.text.muted;
  return <ScrollView style={[s.page,{backgroundColor:colors.surface.canvas}]} contentContainerStyle={s.content}>
    <View style={s.header}><View><Text style={[s.eyebrow,{color:'#287A5B'}]}>BOOKWORM LIBRARY · ATTENDANCE</Text><Text style={[s.title,{color:ink}]}>Attendance & access</Text><Text style={{color:muted}}>{currentTenant.name} · Live records from Supabase</Text></View><TouchableOpacity style={s.refresh} onPress={() => void refresh()}><RefreshCw size={17} color="#287A5B"/><Text style={s.refreshText}>Refresh</Text></TouchableOpacity></View>
    {!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}{!!notice && <Text style={s.notice}>{notice}</Text>}
    <View style={s.stats}><Card color={surface}><Users color="#287A5B"/><Text style={[s.statValue,{color:ink}]}>{inside.length}</Text><Text style={{color:muted}}>Currently inside</Text></Card><Card color={surface}><CalendarCheck color="#287A5B"/><Text style={[s.statValue,{color:ink}]}>{records.length}</Text><Text style={{color:muted}}>Visits on selected date</Text></Card></View>
    <View style={s.columns}>
      <View style={[s.panel,{backgroundColor:surface,borderColor:colors.surface.border}]}><View style={s.panelHeading}><QrCode color="#287A5B"/><View style={{flex:1}}><Text style={[s.panelTitle,{color:ink}]}>Library attendance QR</Text><Text style={{color:muted}}>One QR supports check-in and check-out.</Text></View></View>
        {token ? <View style={s.qrWrap}><LibXQRCode value={token.token} size={188}/><Text style={[s.expiry,{color:muted}]}>Expires {new Date(token.expires_at).toLocaleString()}</Text></View> : <Text style={[s.helper,{color:muted}]}>Issue a QR to print or display at the entrance. Tokens expire after 24 hours.</Text>}
        <View style={s.actions}><Action title={token?'Regenerate QR':'Generate QR'} onPress={() => void generateQR()} disabled={busy}/>{token && <Action title="Revoke" onPress={() => void revokeQR()} danger disabled={busy}/>}</View>
        <View style={s.security}><ShieldCheck size={16} color="#287A5B"/><Text style={{color:muted,flex:1}}>The backend stores a hash, checks expiry and library membership, and accepts only the signed-in student identity.</Text></View>
      </View>
      <View style={[s.panel,{backgroundColor:surface,borderColor:colors.surface.border,flex:1.4}]}><View style={s.panelHeading}><CalendarCheck color="#287A5B"/><Text style={[s.panelTitle,{color:ink,flex:1}]}>Attendance records</Text></View>
        <View style={s.filters}><TextInput value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" style={[s.input,{color:ink,borderColor:colors.surface.border}]} /><View style={[s.search,{borderColor:colors.surface.border}]}><Search size={16} color={muted}/><TextInput value={query} onChangeText={setQuery} placeholder="Search student" placeholderTextColor={muted} style={[s.searchInput,{color:ink}]}/></View></View>
        {loading ? <ActivityIndicator color="#287A5B"/> : filtered.length===0 ? <Text style={[s.helper,{color:muted}]}>No attendance records for this date.</Text> : filtered.map(r=><View key={r.id} style={[s.row,{borderColor:colors.surface.border}]}><View style={{flex:1}}><Text style={[s.student,{color:ink}]}>{r.studentName}</Text><Text style={{color:muted}}>{r.studentId} · {r.deskNo} · In {r.checkInTime}{r.checkOutTime?` · Out ${r.checkOutTime}`:''}</Text></View><View style={[s.pill,{backgroundColor:r.status==='present'?'#E5F4EB':'#F1F3F1'}]}><Text style={{color:r.status==='present'?'#287A5B':'#5F6B64',fontWeight:'700'}}>{r.status==='present'?'Inside':r.status==='admin_closed'?'Admin closed':'Checked out'}</Text></View>{r.status==='present'&&<TouchableOpacity accessibilityLabel={`Manually check out ${r.studentName}`} onPress={()=>void close(r)} style={s.closeBtn}><XCircle color="#A44" size={20}/></TouchableOpacity>}</View>)}
        {inside.length>0&&<View style={s.correction}><Text style={[s.helper,{color:muted}]}>Manual checkout requires a reason and creates an audit entry.</Text><TextInput value={reason} onChangeText={setReason} placeholder="Correction reason" placeholderTextColor={muted} style={[s.input,{color:ink,borderColor:colors.surface.border,flex:1}]}/></View>}
      </View>
    </View>
    {busy&&<View style={s.busy}><ActivityIndicator color="#287A5B"/><Text style={{color:muted}}>Saving…</Text></View>}
  </ScrollView>;
}
function Card({children,color}:{children:React.ReactNode;color:string}){return <View style={[s.statCard,{backgroundColor:color}]}>{children}</View>}
function Action({title,onPress,disabled,danger}:{title:string;onPress:()=>void;disabled:boolean;danger?:boolean}){return <TouchableOpacity disabled={disabled} onPress={onPress} style={[s.action,danger&&s.danger]}><Text style={{color:danger?'#A44':'#FFF',fontWeight:'700'}}>{title}</Text></TouchableOpacity>}
const s=StyleSheet.create({page:{flex:1},content:{padding:22,gap:18},header:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:10},eyebrow:{fontSize:11,fontWeight:'800',letterSpacing:1},title:{fontSize:28,fontWeight:'800',marginVertical:4},refresh:{flexDirection:'row',gap:7,alignItems:'center',padding:10},refreshText:{color:'#287A5B',fontWeight:'700'},stats:{flexDirection:'row',gap:14},statCard:{flex:1,minWidth:150,borderRadius:14,padding:16,gap:7},statValue:{fontSize:26,fontWeight:'800'},columns:{flexDirection:'row',flexWrap:'wrap',alignItems:'flex-start',gap:16},panel:{flexGrow:1,flexBasis:320,borderWidth:1,borderRadius:14,padding:16,gap:14},panelHeading:{flexDirection:'row',alignItems:'center',gap:10},panelTitle:{fontSize:17,fontWeight:'800'},helper:{fontSize:13,lineHeight:19},qrWrap:{alignItems:'center',gap:6},expiry:{fontSize:12},actions:{flexDirection:'row',gap:8},action:{backgroundColor:'#287A5B',paddingHorizontal:14,paddingVertical:10,borderRadius:9},danger:{backgroundColor:'#FDECE8'},security:{flexDirection:'row',gap:8,alignItems:'center',padding:10,backgroundColor:'#EAF4EE',borderRadius:9},filters:{flexDirection:'row',gap:8,flexWrap:'wrap'},input:{minWidth:130,borderWidth:1,borderRadius:8,padding:10},search:{flex:1,minWidth:170,borderWidth:1,borderRadius:8,paddingHorizontal:9,flexDirection:'row',alignItems:'center',gap:6},searchInput:{flex:1,paddingVertical:9},row:{flexDirection:'row',alignItems:'center',gap:9,paddingVertical:12,borderBottomWidth:1},student:{fontWeight:'800',fontSize:14},pill:{paddingHorizontal:9,paddingVertical:5,borderRadius:20},closeBtn:{padding:4},correction:{flexDirection:'row',alignItems:'center',flexWrap:'wrap',gap:8},busy:{flexDirection:'row',gap:8,alignItems:'center',justifyContent:'center'},error:{color:'#9F2525',backgroundColor:'#FDECE8',padding:10,borderRadius:8},notice:{color:'#245C48',backgroundColor:'#E8EEE5',padding:10,borderRadius:8}});
