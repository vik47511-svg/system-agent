import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Maximize2, X, ChevronUp, ChevronDown } from 'lucide-react';
import { useOverlayStore } from './useOverlayStore';
import { OrbCore } from './components/OrbCore';
import { MicIndicator } from './components/MicIndicator';
import { StateLabel } from './components/StateLabel';
import type { OverlayState } from './types';

const STATE_COLORS: Record<OverlayState, string> = {
  idle:      'rgba(15, 32, 64, 0.85)',
  listening: 'rgba(5, 46, 22, 0.88)',
  thinking:  'rgba(3, 35, 58, 0.88)',
  speaking:  'rgba(4, 47, 46, 0.88)',
  executing: 'rgba(45, 32, 4, 0.88)',
};

const BORDER_COLORS: Record<OverlayState, string> = {
  idle:      'rgba(51, 85, 140, 0.5)',
  listening: 'rgba(16, 185, 129, 0.5)',
  thinking:  'rgba(14, 165, 233, 0.5)',
  speaking:  'rgba(20, 184, 166, 0.5)',
  executing: 'rgba(245, 158, 11, 0.5)',
};

export function OverlayApp() {
  const { state, audioLevel, isMuted, label, handleHide, handleMuteToggle, handleOpenMain } = useOverlayStore();
  const [collapsed, setCollapsed] = useState(false);
  const [hovered, setHovered] = useState(false);

  const bg = STATE_COLORS[state];
  const border = BORDER_COLORS[state];

  return (
    <div
      className="drag-region"
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        padding: 0,
        background: 'transparent',
      }}
    >
      <motion.div
        layout
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        style={{
          background: bg,
          border: `1px solid ${border}`,
          borderRadius: collapsed ? 40 : 20,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px ${border}, inset 0 1px 0 rgba(255,255,255,0.06)`,
          overflow: 'hidden',
          width: collapsed ? 56 : 280,
          minHeight: collapsed ? 56 : 80,
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      >
        <AnimatePresence mode="wait">
          {collapsed ? (
            <CollapsedView
              key="collapsed"
              state={state}
              audioLevel={audioLevel}
              onExpand={() => setCollapsed(false)}
            />
          ) : (
            <ExpandedView
              key="expanded"
              state={state}
              audioLevel={audioLevel}
              isMuted={isMuted}
              label={label}
              hovered={hovered}
              onCollapse={() => setCollapsed(true)}
              onHide={handleHide}
              onMuteToggle={handleMuteToggle}
              onOpenMain={handleOpenMain}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Collapsed pill — just the orb
// ---------------------------------------------------------------------------
function CollapsedView({
  state,
  audioLevel,
  onExpand,
}: {
  state: OverlayState;
  audioLevel: number;
  onExpand: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="no-drag"
      style={{
        width: 56,
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
      }}
      onClick={onExpand}
      title="Expand Atlas AI"
    >
      <OrbCore state={state} audioLevel={audioLevel} size={36} />
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Expanded full overlay
// ---------------------------------------------------------------------------
interface ExpandedViewProps {
  state: OverlayState;
  audioLevel: number;
  isMuted: boolean;
  label: string;
  hovered: boolean;
  onCollapse: () => void;
  onHide: () => void;
  onMuteToggle: () => void;
  onOpenMain: () => void;
}

function ExpandedView({
  state,
  audioLevel,
  isMuted,
  label,
  hovered,
  onCollapse,
  onHide,
  onMuteToggle,
  onOpenMain,
}: ExpandedViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 14px',
        width: 280,
      }}
    >
      {/* Orb */}
      <div className="no-drag" style={{ flexShrink: 0 }}>
        <OrbCore state={state} audioLevel={audioLevel} size={48} />
      </div>

      {/* Center info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <StateLabel state={state} label={label} />
        <MicIndicator state={state} audioLevel={audioLevel} isMuted={isMuted} />
      </div>

      {/* Controls — visible on hover */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.12 }}
            className="no-drag"
            style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}
          >
            <ControlButton
              onClick={onMuteToggle}
              title={isMuted ? 'Unmute' : 'Mute'}
              active={isMuted}
              activeColor="rgba(239,68,68,0.8)"
            >
              {isMuted ? (
                <MicOff style={{ width: 11, height: 11 }} />
              ) : (
                <Mic style={{ width: 11, height: 11 }} />
              )}
            </ControlButton>
            <ControlButton onClick={onOpenMain} title="Open main window">
              <Maximize2 style={{ width: 11, height: 11 }} />
            </ControlButton>
            <ControlButton onClick={onCollapse} title="Collapse">
              <ChevronDown style={{ width: 11, height: 11 }} />
            </ControlButton>
            <ControlButton onClick={onHide} title="Hide overlay" hoverColor="rgba(239,68,68,0.6)">
              <X style={{ width: 11, height: 11 }} />
            </ControlButton>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Always-visible collapse affordance when not hovered */}
      <AnimatePresence>
        {!hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            className="no-drag"
            style={{ flexShrink: 0, cursor: 'pointer' }}
            onClick={onCollapse}
            title="Collapse"
          >
            <ChevronUp style={{ width: 12, height: 12, color: 'rgba(148,163,184,0.8)' }} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ControlButton({
  children,
  onClick,
  title,
  active,
  activeColor = 'rgba(14,165,233,0.3)',
  hoverColor = 'rgba(100,116,139,0.3)',
}: {
  children: React.ReactNode;
  onClick: () => void;
  title?: string;
  active?: boolean;
  activeColor?: string;
  hoverColor?: string;
}) {
  const [hover, setHover] = useState(false);

  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: 22,
        height: 22,
        borderRadius: 6,
        border: '1px solid rgba(100,116,139,0.2)',
        background: active ? activeColor : hover ? hoverColor : 'rgba(30,41,59,0.4)',
        color: active ? '#fff' : hover ? '#e2e8f0' : 'rgba(148,163,184,0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.15s',
        outline: 'none',
      }}
    >
      {children}
    </button>
  );
}
