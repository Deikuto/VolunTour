import { CheckCircle2, LogIn, Compass, Check, X } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LanguageContext'
import { sameCityGroup } from '../lib/cities'
import type { Event } from '../types'

/**
 * The join / leave / guide-request controls for an event. Shared between the
 * slim card and the detail modal so the logic lives in exactly one place.
 */
export default function EventActions({ event }: { event: Event }) {
  const { isJoined, joinEvent, leaveEvent, guideStatus, requestGuide, respondGuide } = useApp()
  const { currentUser, openAuth } = useAuth()
  const { t } = useLang()

  const joined = isJoined(event.id)
  const isLeader = !!currentUser && event.leaderId === currentUser.id
  const spotsLeft = event.maxParticipants - event.participants.length

  // Guide eligibility: a local volunteer from the SAME city group as the event
  // (Несебър and Слънчев бряг count as one), and not the leader.
  const sameCityVolunteer =
    !!currentUser &&
    currentUser.role === 'local_volunteer' &&
    sameCityGroup(currentUser.cityId, event.cityId)
  const gStatus = guideStatus(event.id)
  const pendingGuides = event.guideRequests.filter(g => g.status === 'pending')

  if (isLeader) {
    return (
      <div className="space-y-2">
        <div className="w-full py-2.5 rounded-xl bg-[#0E8C72]/10 text-[#0E8C72] text-sm font-semibold text-center">
          {t('card.youlead')}
        </div>
        {pendingGuides.length > 0 && (
          <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-3">
            <p className="text-xs font-semibold text-amber-700 mb-2 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" />
              {t('card.guide.requests')} ({pendingGuides.length})
            </p>
            <div className="space-y-2">
              {pendingGuides.map(g => (
                <div key={g.userId} className="flex items-center gap-2">
                  <img src={g.avatar} alt={g.name} className="w-6 h-6 rounded-full" />
                  <span className="text-xs text-gray-700 flex-1 truncate">{g.name}</span>
                  <button onClick={() => respondGuide(event.id, g.userId, true)}
                    className="p-1.5 rounded-lg bg-[#0E8C72] text-white hover:bg-[#0A7A63] transition-colors cursor-pointer" title={t('card.guide.accept')}>
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => respondGuide(event.id, g.userId, false)}
                    className="p-1.5 rounded-lg bg-gray-200 text-gray-600 hover:bg-red-100 hover:text-red-600 transition-colors cursor-pointer" title={t('card.guide.decline')}>
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  if (!currentUser) {
    return (
      <button onClick={() => openAuth('login')}
        className="w-full py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 text-sm font-semibold flex items-center justify-center gap-2 hover:border-[#0E8C72] hover:text-[#0E8C72] transition-all duration-200 cursor-pointer">
        <LogIn className="w-4 h-4" />
        {t('card.loginto')}
      </button>
    )
  }

  return (
    <div className="space-y-2">
      {joined ? (
        <button onClick={() => leaveEvent(event.id)}
          className="w-full py-2.5 rounded-xl border-2 border-[#0E8C72] text-[#0E8C72] text-sm font-semibold flex items-center justify-center gap-2 hover:bg-red-50 hover:border-red-400 hover:text-red-600 transition-all duration-200 cursor-pointer">
          <CheckCircle2 className="w-4 h-4" />
          {t('card.joined')}
        </button>
      ) : (
        <button onClick={() => joinEvent(event.id)} disabled={spotsLeft === 0}
          className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
            spotsLeft === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-[#0E8C72] text-white hover:bg-[#0A7A63] active:scale-[0.98]'
          }`}>
          {spotsLeft === 0 ? t('card.filled') : t('card.join')}
        </button>
      )}

      {sameCityVolunteer && (
        gStatus === 'none' ? (
          <button onClick={() => requestGuide(event.id)}
            className="w-full py-2.5 rounded-xl border-2 border-[#0F766E] text-[#0B6F5B] text-sm font-semibold flex items-center justify-center gap-2 hover:bg-amber-50 transition-all duration-200 cursor-pointer">
            <Compass className="w-4 h-4" />
            {t('card.guide.apply')}
          </button>
        ) : gStatus === 'pending' ? (
          <div className="w-full py-2.5 rounded-xl bg-amber-50 text-amber-700 text-sm font-semibold text-center border border-amber-100">
            {t('card.guide.pending')}
          </div>
        ) : gStatus === 'accepted' ? (
          <div className="w-full py-2.5 rounded-xl bg-[#0F766E]/15 text-[#0B6F5B] text-sm font-semibold text-center flex items-center justify-center gap-2">
            <Compass className="w-4 h-4" />
            {t('card.guide.accepted')}
          </div>
        ) : (
          <div className="w-full py-2.5 rounded-xl bg-gray-100 text-gray-500 text-sm font-semibold text-center">
            {t('card.guide.declined')}
          </div>
        )
      )}
    </div>
  )
}
