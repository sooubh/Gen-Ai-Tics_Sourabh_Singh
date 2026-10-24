'use client';

import React from 'react';
import { ExtractedEntity } from '@/types';
import { Tag, Check, X, User, Phone, MapPin, Calendar, DollarSign, Wallet, ShieldCheck } from 'lucide-react';

interface EntityListProps {
  entities: ExtractedEntity[];
  onConfirmEntity?: (entityId: string) => void;
  onDismissEntity?: (entityId: string) => void;
  onSeekToEntity?: (timestamp?: number) => void;
}

export function EntityList({
  entities,
  onConfirmEntity,
  onDismissEntity,
  onSeekToEntity,
}: EntityListProps) {
  const getEntityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'person':
        return <User className="h-3.5 w-3.5 text-[#8a9a5b]" />;
      case 'phone':
        return <Phone className="h-3.5 w-3.5 text-[#ffb964]" />;
      case 'crypto_wallet':
      case 'crypto':
        return <Wallet className="h-3.5 w-3.5 text-[#d9eaa7]" />;
      case 'location':
      case 'address':
        return <MapPin className="h-3.5 w-3.5 text-[#8a9a5b]" />;
      case 'date_time':
      case 'date':
        return <Calendar className="h-3.5 w-3.5 text-[#ffb964]" />;
      case 'money_amount':
      case 'amount':
        return <DollarSign className="h-3.5 w-3.5 text-[#d9eaa7]" />;
      default:
        return <Tag className="h-3.5 w-3.5 text-[#9e9c96]" />;
    }
  };

  return (
    <div className="rounded-lg border border-[#35373e] bg-[#18191c] p-3.5 shadow-sm flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-[#35373e]/40 pb-2">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-[#8a9a5b]" />
          <h3 className="text-sm font-semibold text-[#edeae1]">Extracted Entities</h3>
        </div>
        <span className="rounded bg-[#23252a] px-1.5 py-0.5 font-mono text-[11px] text-[#8a9a5b] border border-[#35373e]">
          {entities.length} Indexed
        </span>
      </div>

      <div className="flex flex-col gap-2 max-h-[350px] overflow-y-auto pr-1">
        {entities.length === 0 ? (
          <p className="text-xs text-[#9e9c96] italic p-2">No named entities detected yet.</p>
        ) : (
          entities.map((ent) => {
            const isConfirmed = ent.verificationStatus === 'confirmed' || ent.status === 'confirmed' || ent.status === 'verified';
            const isDismissed = ent.verificationStatus === 'dismissed' || ent.status === 'dismissed';
            const evidenceStartTime = ent.evidence?.startTime ?? ent.timestamp;

            return (
              <div
                key={ent.id}
                onClick={() => {
                  if (evidenceStartTime !== undefined && onSeekToEntity) {
                    onSeekToEntity(evidenceStartTime);
                  }
                }}
                className={`flex items-start justify-between gap-2 rounded border p-2.5 transition-colors ${
                  evidenceStartTime !== undefined ? 'cursor-pointer hover:border-[#8a9a5b]/60' : ''
                } ${
                  isConfirmed
                    ? 'border-[#5a8264]/40 bg-[#1c1f1c]'
                    : isDismissed
                    ? 'border-[#35373e]/30 bg-[#18191c] opacity-60'
                    : 'border-[#35373e] bg-[#23252a] hover:border-[#35373e]'
                }`}
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded bg-[#18191c] border border-[#35373e]">
                    {getEntityIcon(ent.type)}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-xs text-[#edeae1] truncate">
                        {ent.value || ent.text}
                      </span>
                      <span className="rounded bg-[#18191c] px-1.5 py-0.2 font-mono text-[9px] uppercase tracking-wider text-[#9e9c96] border border-[#35373e]">
                        {ent.type}
                      </span>
                    </div>
                    {ent.normalizedValue && (
                      <p className="text-[11px] text-[#9e9c96] truncate mt-0.5">
                        {ent.normalizedValue}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1 font-mono text-[10px] text-[#71706b]">
                      <span>Conf: {ent.confidence}%</span>
                      {evidenceStartTime !== undefined && (
                        <>
                          <span>•</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSeekToEntity && onSeekToEntity(evidenceStartTime);
                            }}
                            className="text-[#8a9a5b] hover:underline"
                          >
                            Seek @ {Math.floor(evidenceStartTime / 60)}:
                            {Math.floor(evidenceStartTime % 60).toString().padStart(2, '0')}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
                  {isConfirmed ? (
                    <span className="inline-flex items-center gap-1 rounded bg-[#5a8264]/20 px-1.5 py-0.5 font-mono text-[10px] text-[#7ea886] border border-[#5a8264]/40">
                      <ShieldCheck className="h-3 w-3" />
                      Verified
                    </span>
                  ) : isDismissed ? (
                    <span className="rounded bg-[#23252a] px-1.5 py-0.5 font-mono text-[10px] text-[#71706b]">
                      Dismissed
                    </span>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => onConfirmEntity && onConfirmEntity(ent.id)}
                        className="rounded p-1 text-[#5a8264] hover:bg-[#5a8264]/20 border border-[#5a8264]/30 transition-colors"
                        title="Confirm Entity"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDismissEntity && onDismissEntity(ent.id)}
                        className="rounded p-1 text-[#b84a44] hover:bg-[#b84a44]/20 border border-[#b84a44]/30 transition-colors"
                        title="Dismiss Entity"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
