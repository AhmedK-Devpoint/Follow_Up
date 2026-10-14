import { makeStyles, tokens } from '@fluentui/react-components';

/** Styles communs aux panneaux de détail (suivi et email). */
export const useDetailStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100%',
  },
  commandBar: {
    position: 'sticky',
    top: 0,
    zIndex: 1,
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    // Place réservée à droite pour la croix, qui ne passe jamais à la ligne.
    padding: `${tokens.spacingVerticalM} 48px ${tokens.spacingVerticalM} ${tokens.spacingHorizontalL}`,
    backgroundColor: 'var(--fu-bar-bg)',
    backdropFilter: 'var(--fu-bar-blur)',
    WebkitBackdropFilter: 'var(--fu-bar-blur)',
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  close: {
    position: 'absolute',
    top: tokens.spacingVerticalM,
    right: tokens.spacingHorizontalS,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
    padding: tokens.spacingHorizontalXL,
    '@media (max-width: 599px)': {
      padding: tokens.spacingHorizontalL,
    },
  },
  muted: {
    color: tokens.colorNeutralForeground3,
  },
});
