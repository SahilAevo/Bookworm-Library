import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CalendarCheck, X } from 'lucide-react-native';
import { useThemeMode } from '@/context/ThemeContext';

interface Props {
  visible: boolean;
  onClose: () => void;
  onAttendanceUpdated?: (todayTotal: number) => void;
  onOpenFullAttendanceHub?: () => void;
}

/** Manual attendance is managed from the audited, database-backed attendance dashboard. */
export function MarkAttendanceModal({ visible, onClose, onOpenFullAttendanceHub }: Props) {
  const { colors, isDark } = useThemeMode();
  return <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <View style={s.backdrop}><View style={[s.card,{backgroundColor:isDark?colors.surface.card:'#FFF',borderColor:colors.surface.border}]}>
      <View style={s.heading}><CalendarCheck color="#287A5B"/><Text style={[s.title,{color:colors.text.primary}]}>Manage attendance</Text><TouchableOpacity onPress={onClose}><X color={colors.text.muted}/></TouchableOpacity></View>
      <Text style={{color:colors.text.secondary,lineHeight:20}}>Attendance changes are saved to the library database. Open the attendance dashboard to review current sessions or make an audited manual checkout.</Text>
      <TouchableOpacity style={s.button} onPress={()=>{onClose();onOpenFullAttendanceHub?.();}}><Text style={s.buttonText}>Open attendance dashboard</Text></TouchableOpacity>
    </View></View>
  </Modal>;
}
const s=StyleSheet.create({backdrop:{flex:1,backgroundColor:'rgba(20,35,27,0.45)',alignItems:'center',justifyContent:'center',padding:20},card:{width:'100%',maxWidth:460,borderWidth:1,borderRadius:16,padding:20,gap:16},heading:{flexDirection:'row',alignItems:'center',gap:10},title:{fontSize:18,fontWeight:'800',flex:1},button:{backgroundColor:'#287A5B',padding:12,borderRadius:9,alignItems:'center'},buttonText:{color:'#FFF',fontWeight:'700'}});
