import {
  Avatar,
  Button,
  Caption1,
  makeStyles,
  mergeClasses,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  Text,
  tokens,
} from '@fluentui/react-components';
import {
  ArrowExit20Regular,
  MoreVertical20Regular,
  PersonArrowRight20Regular,
  Settings20Regular,
  Sparkle20Regular,
} from '@fluentui/react-icons';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    flexGrow: 1,
    minWidth: 0,
  },
  identity: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    minWidth: 0,
    lineHeight: tokens.lineHeightBase200,
  },
  avatar: {
    flexShrink: 0,
  },
  demoAvatar: {
    boxShadow: '0 0 0 2px var(--fu-side-avatar-ring)',
  },
  name: {
    color: 'var(--fu-side-fg)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  detail: {
    color: 'var(--fu-side-fg3)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  menuButton: {
    flexShrink: 0,
    color: 'var(--fu-side-fg)',
    ':hover': { color: 'var(--fu-side-fg)', backgroundColor: 'var(--fu-side-hover)' },
    ':hover:active': { color: 'var(--fu-side-fg)', backgroundColor: 'var(--fu-side-pressed)' },
  },
});

type AccountPanelProps = { onOpenPreferences: () => void; onOpenIntro: () => void } & (
  | { mode: 'outlook'; name: string; username: string; busy: boolean; onSignOut: () => void }
  | { mode: 'demo'; signInAvailable: boolean; onSignIn: () => void; onExitDemo: () => void }
);

export function AccountPanel(props: AccountPanelProps) {
  const styles = useStyles();
  const isOutlook = props.mode === 'outlook';
  const title = isOutlook ? props.name || props.username : 'Mode démonstration';
  const subtitle = isOutlook ? props.username : 'Données fictives';

  return (
    <div className={styles.root}>
      <Avatar
        className={mergeClasses(styles.avatar, !isOutlook && styles.demoAvatar)}
        name={isOutlook ? title : undefined}
        color={isOutlook ? 'colorful' : 'brand'}
        size={32}
      />
      <div className={styles.identity}>
        <Text weight="semibold" className={styles.name} title={title}>
          {title}
        </Text>
        <Caption1 className={styles.detail} title={subtitle}>
          {subtitle}
        </Caption1>
      </div>
      <Menu positioning="above-end">
        <MenuTrigger disableButtonEnhancement>
          <Button
            className={styles.menuButton}
            appearance="transparent"
            icon={<MoreVertical20Regular />}
            aria-label="Options du compte"
          />
        </MenuTrigger>
        <MenuPopover>
          <MenuList>
            <MenuItem icon={<Settings20Regular />} onClick={props.onOpenPreferences}>
              Préférences
            </MenuItem>
            <MenuItem icon={<Sparkle20Regular />} onClick={props.onOpenIntro}>
              Revoir l’introduction
            </MenuItem>
            {props.mode === 'outlook' ? (
              <MenuItem icon={<ArrowExit20Regular />} onClick={props.onSignOut} disabled={props.busy}>
                Se déconnecter
              </MenuItem>
            ) : (
              <>
                {props.signInAvailable && (
                  <MenuItem icon={<PersonArrowRight20Regular />} onClick={props.onSignIn}>
                    Se connecter avec Microsoft
                  </MenuItem>
                )}
                <MenuItem icon={<ArrowExit20Regular />} onClick={props.onExitDemo}>
                  Quitter la démo
                </MenuItem>
              </>
            )}
          </MenuList>
        </MenuPopover>
      </Menu>
    </div>
  );
}
