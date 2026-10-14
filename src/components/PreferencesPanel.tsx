import {
  Button,
  Caption1,
  Dropdown,
  Field,
  Input,
  makeStyles,
  Option,
  OverlayDrawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerHeaderTitle,
  Radio,
  RadioGroup,
  Subtitle2,
  Switch,
  Text,
  tokens,
} from '@fluentui/react-components';
import {
  Building20Regular,
  Dismiss24Regular,
  Person20Regular,
  PersonEdit20Regular,
  Sparkle16Regular,
} from '@fluentui/react-icons';
import { useState, type ReactNode } from 'react';
import { ROLE_PRESETS, type Preferences, type Role, type WorkWeek } from '../hooks/usePreferences';
import type { Priority } from '../types/followUp';
import { PRIORITY_LABELS, VIEW_LABELS } from '../utils/followUps';
import { DELAYS, PRIORITY_DOTS, ROLES, START_VIEWS, WORK_WEEKS } from '../utils/preferenceOptions';

const PRIORITIES: Priority[] = ['high', 'normal', 'low'];

const useStyles = makeStyles({
  body: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
    paddingTop: tokens.spacingVerticalM,
    paddingBottom: tokens.spacingVerticalL,
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
    padding: tokens.spacingHorizontalL,
    borderRadius: '16px',
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
  },
  sectionHead: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  muted: {
    color: tokens.colorNeutralForeground3,
  },
  row: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
    gap: tokens.spacingHorizontalM,
  },
  presetNote: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    color: tokens.colorBrandForeground1,
  },
  priority: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: tokens.borderRadiusCircular,
  },
  switchRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalM,
  },
  switchText: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: tokens.spacingHorizontalS,
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    paddingTop: tokens.spacingVerticalM,
  },
});

function Section({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  const styles = useStyles();
  return (
    <section className={styles.section}>
      <div className={styles.sectionHead}>
        <Subtitle2 as="h3">{title}</Subtitle2>
        <Caption1 className={styles.muted}>{description}</Caption1>
      </div>
      {children}
    </section>
  );
}

interface PreferencesPanelProps {
  open: boolean;
  initial: Preferences;
  onClose: () => void;
  /** Enregistre les préférences ; sons et mode d'interface s'appliquent immédiatement. */
  onSave: (preferences: Preferences) => void;
}

/** Toutes les préférences sur une seule page, dans un tiroir latéral. */
export function PreferencesPanel({ open, initial, onClose, onSave }: PreferencesPanelProps) {
  const styles = useStyles();
  const [prefs, setPrefs] = useState(initial);
  const update = (patch: Partial<Preferences>) => setPrefs((current) => ({ ...current, ...patch }));
  const preset = prefs.role ? ROLE_PRESETS[prefs.role] : null;
  const delay = DELAYS.find((d) => d.days === prefs.reminderDays) ?? DELAYS[2];
  const startView = START_VIEWS.find((v) => v.value === prefs.startView) ?? START_VIEWS[0];

  const save = () =>
    onSave({
      ...prefs,
      firstName: prefs.firstName.trim(),
      companyName: prefs.companyName.trim(),
      customRole: prefs.customRole.trim(),
    });

  return (
    <OverlayDrawer
      open={open}
      position="end"
      size="medium"
      onOpenChange={(_, data) => !data.open && onClose()}
      aria-label="Préférences"
    >
      <DrawerHeader>
        <DrawerHeaderTitle
          action={<Button appearance="subtle" aria-label="Fermer" icon={<Dismiss24Regular />} onClick={onClose} />}
        >
          Préférences
        </DrawerHeaderTitle>
      </DrawerHeader>

      <DrawerBody className={styles.body}>
        <Section title="Vous" description="Votre prénom pour l’accueil, votre rôle pour pré-régler les relances.">
          <div className={styles.row}>
            <Field label="Prénom">
              <Input
                contentBefore={<Person20Regular />}
                placeholder="Ex. : Camille"
                value={prefs.firstName}
                onChange={(_, data) => update({ firstName: data.value })}
              />
            </Field>
            <Field label="Rôle">
              <Dropdown
                placeholder="Choisir un rôle"
                value={prefs.role ? ROLE_PRESETS[prefs.role].label : ''}
                selectedOptions={prefs.role ? [prefs.role] : []}
                onOptionSelect={(_, data) => {
                  const role = data.optionValue as Role;
                  update({ role, ...ROLE_PRESETS[role].preset });
                }}
              >
                {ROLES.map((role) => (
                  <Option key={role} value={role} text={ROLE_PRESETS[role].label}>
                    {ROLE_PRESETS[role].label}
                  </Option>
                ))}
              </Dropdown>
            </Field>
          </div>
          {prefs.role === 'custom' && (
            <Field label="Votre métier">
              <Input
                contentBefore={<PersonEdit20Regular />}
                placeholder="Ex. : Responsable RH, juriste, comptable…"
                value={prefs.customRole}
                onChange={(_, data) => update({ customRole: data.value })}
              />
            </Field>
          )}
          {preset?.preset && prefs.role !== initial.role && (
            <Caption1 className={styles.presetNote}>
              <Sparkle16Regular aria-hidden />
              Réglages recommandés pour « {preset.label} » appliqués aux relances ci-dessous.
            </Caption1>
          )}
        </Section>

        <Section title="Votre entreprise" description="Une relance n’est jamais planifiée un jour non travaillé.">
          <Field label="Nom de l’entreprise">
            <Input
              contentBefore={<Building20Regular />}
              placeholder="Ex. : Devpoint"
              value={prefs.companyName}
              onChange={(_, data) => update({ companyName: data.value })}
            />
          </Field>
          <Field label="Jours travaillés">
            <RadioGroup
              layout="horizontal"
              value={prefs.workWeek}
              onChange={(_, data) => update({ workWeek: data.value as WorkWeek })}
            >
              {WORK_WEEKS.map(({ value, label }) => (
                <Radio key={value} value={value} label={label} />
              ))}
            </RadioGroup>
          </Field>
        </Section>

        <Section title="Vos relances" description="Proposées à chaque nouveau suivi, modifiables au cas par cas.">
          <div className={styles.row}>
            <Field label="Relancer par défaut au bout de">
              <Dropdown
                value={delay.label}
                selectedOptions={[String(delay.days)]}
                onOptionSelect={(_, data) => update({ reminderDays: Number(data.optionValue) })}
              >
                {DELAYS.map(({ days, label }) => (
                  <Option key={days} value={String(days)}>
                    {label}
                  </Option>
                ))}
              </Dropdown>
            </Field>
            <Field label="Afficher à l’ouverture">
              <Dropdown
                value={VIEW_LABELS[startView.value]}
                selectedOptions={[startView.value]}
                onOptionSelect={(_, data) => update({ startView: data.optionValue as Preferences['startView'] })}
              >
                {START_VIEWS.map(({ value }) => (
                  <Option key={value} value={value}>
                    {VIEW_LABELS[value]}
                  </Option>
                ))}
              </Dropdown>
            </Field>
          </div>
          <Field label="Priorité par défaut">
            <RadioGroup
              layout="horizontal"
              value={prefs.defaultPriority}
              onChange={(_, data) => update({ defaultPriority: data.value as Priority })}
            >
              {PRIORITIES.map((priority) => (
                <Radio
                  key={priority}
                  value={priority}
                  label={
                    <span className={styles.priority}>
                      <span className={styles.dot} style={{ backgroundColor: PRIORITY_DOTS[priority] }} aria-hidden />
                      {PRIORITY_LABELS[priority]}
                    </span>
                  }
                />
              ))}
            </RadioGroup>
          </Field>
        </Section>

        <Section title="Interface" description="Apparence et sons de l’application sur cet appareil.">
          <div className={styles.switchRow}>
            <span className={styles.switchText}>
              <Text weight="semibold">Sons</Text>
              <Caption1 className={styles.muted}>Bruitage de l’intro, clics et validation d’un suivi.</Caption1>
            </span>
            <Switch checked={prefs.sound} onChange={(_, data) => update({ sound: data.checked })} aria-label="Sons" />
          </div>
          <div className={styles.switchRow}>
            <span className={styles.switchText}>
              <Text weight="semibold">Glassmorphisme</Text>
              <Caption1 className={styles.muted}>
                Transparences, flou et dégradé. Désactivé : interface sobre et professionnelle, façon Outlook.
              </Caption1>
            </span>
            <Switch
              checked={prefs.glass}
              onChange={(_, data) => update({ glass: data.checked })}
              aria-label="Glassmorphisme"
            />
          </div>
        </Section>
      </DrawerBody>

      <DrawerFooter className={styles.footer}>
        <Button onClick={onClose}>Annuler</Button>
        <Button appearance="primary" onClick={save} data-sound="click">
          Enregistrer
        </Button>
      </DrawerFooter>
    </OverlayDrawer>
  );
}
