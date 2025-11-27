import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  arrayUnion,
  type Timestamp,
} from 'firebase/firestore'
import { db } from './config'
import type { Invitation, MemberRole, Member } from '@/types'

// Firestore의 Timestamp를 Date로 변환
function timestampToDate(timestamp: Timestamp | Date | null | undefined): Date {
  if (!timestamp) return new Date()
  if (timestamp instanceof Date) return timestamp
  return timestamp.toDate()
}

// Firestore 문서를 Invitation 타입으로 변환
function convertFirestoreInvitation(docId: string, data: any): Invitation {
  return {
    id: docId,
    ledgerId: data.ledgerId,
    ledgerName: data.ledgerName,
    email: data.email.toLowerCase(),
    role: data.role,
    status: data.status,
    invitedBy: data.invitedBy,
    invitedByName: data.invitedByName,
    createdAt: timestampToDate(data.createdAt),
    respondedAt: data.respondedAt ? timestampToDate(data.respondedAt) : undefined,
  }
}

/**
 * 특정 가계부의 대기 중인 초대 목록 조회
 */
export async function getPendingInvitationsByLedger(ledgerId: string): Promise<Invitation[]> {
  try {
    const invitationsRef = collection(db, 'invitations')
    const q = query(
      invitationsRef,
      where('ledgerId', '==', ledgerId),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    )
    const querySnapshot = await getDocs(q)

    const invitations: Invitation[] = []
    querySnapshot.forEach((doc) => {
      invitations.push(convertFirestoreInvitation(doc.id, doc.data()))
    })

    return invitations
  } catch (error) {
    console.error('초대 목록 조회 실패:', error)
    throw error
  }
}

/**
 * 특정 사용자(이메일)의 받은 초대 목록 조회
 */
export async function getInvitationsByEmail(email: string): Promise<Invitation[]> {
  try {
    const invitationsRef = collection(db, 'invitations')
    const q = query(
      invitationsRef,
      where('email', '==', email.toLowerCase()),
      orderBy('createdAt', 'desc')
    )
    const querySnapshot = await getDocs(q)

    const invitations: Invitation[] = []
    querySnapshot.forEach((doc) => {
      invitations.push(convertFirestoreInvitation(doc.id, doc.data()))
    })

    return invitations
  } catch (error) {
    console.error('받은 초대 목록 조회 실패:', error)
    throw error
  }
}

/**
 * 대기 중인 초대 개수 조회
 */
export async function getPendingInvitationCount(email: string): Promise<number> {
  try {
    const invitationsRef = collection(db, 'invitations')
    const q = query(
      invitationsRef,
      where('email', '==', email.toLowerCase()),
      where('status', '==', 'pending')
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.size
  } catch (error) {
    console.error('대기 초대 개수 조회 실패:', error)
    return 0
  }
}

/**
 * 초대 생성
 */
export async function createInvitation(
  ledgerId: string,
  ledgerName: string,
  email: string,
  role: MemberRole,
  invitedBy: string,
  invitedByName: string
): Promise<string> {
  try {
    // 이미 대기 중인 초대가 있는지 확인
    const existingInvitations = await getPendingInvitationsByLedger(ledgerId)
    const alreadyInvited = existingInvitations.find(
      (inv) => inv.email.toLowerCase() === email.toLowerCase()
    )
    if (alreadyInvited) {
      throw new Error('이미 초대된 이메일입니다.')
    }

    const invitationsRef = collection(db, 'invitations')
    const invitationData = {
      ledgerId,
      ledgerName,
      email: email.toLowerCase(),
      role,
      status: 'pending',
      invitedBy,
      invitedByName,
      createdAt: serverTimestamp(),
    }

    const docRef = await addDoc(invitationsRef, invitationData)
    return docRef.id
  } catch (error) {
    console.error('초대 생성 실패:', error)
    throw error
  }
}

/**
 * 초대 수락
 */
export async function acceptInvitation(
  invitationId: string,
  userId: string,
  userName: string
): Promise<void> {
  try {
    // 1. 초대 정보 조회
    const invitationRef = doc(db, 'invitations', invitationId)
    const invitationSnap = await getDoc(invitationRef)

    if (!invitationSnap.exists()) {
      throw new Error('초대를 찾을 수 없습니다.')
    }

    const invitation = invitationSnap.data()
    if (invitation.status !== 'pending') {
      throw new Error('이미 처리된 초대입니다.')
    }

    // 2. 가계부에 멤버 추가
    const ledgerRef = doc(db, 'ledgers', invitation.ledgerId)

    await updateDoc(ledgerRef, {
      members: arrayUnion({
        userId,
        email: invitation.email,
        name: userName,
        role: invitation.role,
        joinedAt: new Date(),
      }),
      memberIds: arrayUnion(userId),
      updatedAt: serverTimestamp(),
    })

    // 3. 초대 상태 업데이트
    await updateDoc(invitationRef, {
      status: 'accepted',
      respondedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error('초대 수락 실패:', error)
    throw error
  }
}

/**
 * 초대 거절
 */
export async function rejectInvitation(invitationId: string): Promise<void> {
  try {
    const invitationRef = doc(db, 'invitations', invitationId)
    const invitationSnap = await getDoc(invitationRef)

    if (!invitationSnap.exists()) {
      throw new Error('초대를 찾을 수 없습니다.')
    }

    const invitation = invitationSnap.data()
    if (invitation.status !== 'pending') {
      throw new Error('이미 처리된 초대입니다.')
    }

    await updateDoc(invitationRef, {
      status: 'rejected',
      respondedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error('초대 거절 실패:', error)
    throw error
  }
}

/**
 * 초대 취소 (삭제)
 */
export async function cancelInvitation(invitationId: string): Promise<void> {
  try {
    const invitationRef = doc(db, 'invitations', invitationId)
    await deleteDoc(invitationRef)
  } catch (error) {
    console.error('초대 취소 실패:', error)
    throw error
  }
}

/**
 * 가계부에서 멤버 제거
 */
export async function removeMemberFromLedger(
  ledgerId: string,
  memberUserId: string
): Promise<void> {
  try {
    const ledgerRef = doc(db, 'ledgers', ledgerId)
    const ledgerSnap = await getDoc(ledgerRef)

    if (!ledgerSnap.exists()) {
      throw new Error('가계부를 찾을 수 없습니다.')
    }

    const ledgerData = ledgerSnap.data()
    const updatedMembers = ledgerData.members.filter((m: any) => m.userId !== memberUserId)
    const updatedMemberIds = ledgerData.memberIds.filter((id: string) => id !== memberUserId)

    await updateDoc(ledgerRef, {
      members: updatedMembers,
      memberIds: updatedMemberIds,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error('멤버 제거 실패:', error)
    throw error
  }
}

/**
 * 멤버 권한 변경
 */
export async function updateMemberRole(
  ledgerId: string,
  memberUserId: string,
  newRole: MemberRole
): Promise<void> {
  try {
    const ledgerRef = doc(db, 'ledgers', ledgerId)
    const ledgerSnap = await getDoc(ledgerRef)

    if (!ledgerSnap.exists()) {
      throw new Error('가계부를 찾을 수 없습니다.')
    }

    const ledgerData = ledgerSnap.data()
    const updatedMembers = ledgerData.members.map((m: any) => {
      if (m.userId === memberUserId) {
        return { ...m, role: newRole }
      }
      return m
    })

    await updateDoc(ledgerRef, {
      members: updatedMembers,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error('멤버 권한 변경 실패:', error)
    throw error
  }
}
