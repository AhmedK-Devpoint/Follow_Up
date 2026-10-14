import {
  Body1,
  Button,
  Caption1,
  Field,
  Input,
  makeStyles,
  mergeClasses,
  Text,
  tokens,
  Tooltip,
} from '@fluentui/react-components';
import {
  ArrowLeft20Regular,
  ArrowRight20Regular,
  Building20Regular,
  CalendarClock20Regular,
  Checkmark20Regular,
  Dismiss20Regular,
  Eye16Regular,
  LockClosed16Regular,
  Mail20Regular,
  MailCheckmark24Filled,
  Person20Regular,
  PersonEdit20Regular,
  Sparkle16Regular,
  Warning20Regular,
} from '@fluentui/react-icons';
import { useRef, useState, type FormEvent, type ReactNode } from 'react';
import { ROLE_PRESETS, type Preferences, type Role } from '../hooks/usePreferences';
import { APP_GRADIENT, frosted } from '../theme';
import type { Priority } from '../types/followUp';
import { PRIORITY_LABELS, VIEW_LABELS } from '../utils/followUps';
import { gsap, reduceMotion, useGSAP } from '../utils/motion';
import { DELAYS, PRIORITY_DOTS, ROLES, START_VIEWS, WORK_WEEKS } from '../utils/preferenceOptions';

const STEP_TITLES = ['Introduction', 'Vous', 'Votre entreprise', 'Vos relances', 'Récapitulatif'];
const INTRO_TITLE = 'Plus aucune relance oubliée.';

const useStyles = makeStyles({
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 100,
    display: 'grid',
    placeItems: 'center',
    overflowY: 'auto',
    padding: tokens.spacingHorizontalL,
    backgroundImage: APP_GRADIENT,
    backgroundColor: '#5a3fae',
  },
  orb: {
    position: 'fixed',
    borderRadius: '50%',
    filter: 'blur(60px)',
    opacity: 0.55,
    pointerEvents: 'none',
  },
  orbA: {
    top: '8%',
    left: '12%',
    width: '320px',
    height: '320px',
    backgroundColor: '#8e79ea',
  },
  orbB: {
    bottom: '6%',
    right: '10%',
    width: '380px',
    height: '380px',
    backgroundColor: '#e6a274',
  },
  card: {
    ...frosted,
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXL,
    width: '100%',
    maxWidth: '600px',
    margin: 0,
    padding: '36px',
    borderRadius: '28px',
    '@media (max-width: 479px)': {
      padding: '24px 20px',
      borderRadius: '22px',
    },
  },
  top: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalM,
    minHeight: '32px',
  },
  progress: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    minWidth: 0,
  },
  dot: {
    flexShrink: 0,
    width: '8px',
    height: '8px',
    borderRadius: tokens.borderRadiusCircular,
    backgroundColor: tokens.colorNeutralStroke1,
    transitionProperty: 'width, background-color',
    transitionDuration: tokens.durationNormal,
  },
  dotActive: {
    width: '24px',
    backgroundColor: tokens.colorBrandBackground,
  },
  dotDone: {
    backgroundColor: tokens.colorBrandStroke2,
  },
  stepLabel: {
    marginLeft: tokens.spacingHorizontalXS,
    color: tokens.colorNeutralForeground3,
    whiteSpace: 'nowrap',
  },
  step: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
    minWidth: 0,
  },
  logo: {
    display: 'grid',
    placeItems: 'center',
    width: '56px',
    height: '56px',
    borderRadius: '18px',
    color: '#fff',
    backgroundImage: 'linear-gradient(135deg, #6042d1, #c86f8c)',
    boxShadow: '0 8px 20px rgba(96, 66, 209, 0.35)',
  },
  eyebrow: {
    display: 'block',
    marginBottom: tokens.spacingVerticalXS,
    color: tokens.colorBrandForeground1,
    fontWeight: tokens.fontWeightSemibold,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  },
  hero: {
    margin: 0,
    fontSize: '34px',
    lineHeight: '42px',
    fontWeight: tokens.fontWeightBold,
    letterSpacing: '-0.025em',
    color: '#141233',
    '@media (max-width: 479px)': {
      fontSize: '28px',
      lineHeight: '34px',
    },
  },
  word: {
    display: 'inline-block',
    whiteSpace: 'pre',
  },
  title: {
    margin: 0,
    fontSize: '28px',
    lineHeight: '36px',
    fontWeight: tokens.fontWeightBold,
    letterSpacing: '-0.02em',
    color: '#141233',
    '@media (max-width: 479px)': {
      fontSize: '24px',
      lineHeight: '30px',
    },
  },
  lead: {
    display: 'block',
    marginTop: tokens.spacingVerticalXS,
    color: tokens.colorNeutralForeground2,
  },
  features: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))',
    gap: tokens.spacingHorizontalS,
    margin: 0,
    padding: 0,
    listStyleType: 'none',
  },
  feature: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
    padding: tokens.spacingHorizontalM,
    borderRadius: '14px',
    backgroundColor: 'rgba(96, 66, 209, 0.06)',
  },
  featureIcon: {
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    width: '32px',
    height: '32px',
    marginBottom: tokens.spacingVerticalXS,
    borderRadius: '10px',
    color: tokens.colorBrandForeground1,
    backgroundColor: tokens.colorNeutralBackground1,
    boxShadow: tokens.shadow2,
  },
  stack: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  muted: {
    color: tokens.colorNeutralForeground3,
  },
  reassurance: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalL}`,
    color: tokens.colorNeutralForeground3,
  },
  reassuranceItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
  },
  group: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
    margin: 0,
    padding: 0,
    border: 'none',
    minWidth: 0,
  },
  legend: {
    padding: 0,
    marginBottom: tokens.spacingVerticalXS,
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalS,
  },
  choices: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))',
    gap: tokens.spacingHorizontalS,
  },
  choice: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    minWidth: 0,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    borderRadius: '12px',
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
    cursor: 'pointer',
    transitionProperty: 'border-color, background-color, box-shadow',
    transitionDuration: tokens.durationFaster,
    ':hover': {
      border: `1px solid ${tokens.colorBrandStroke2}`,
    },
    ':focus-within': {
      outline: `2px solid ${tokens.colorStrokeFocus2}`,
      outlineOffset: '2px',
    },
  },
  chip: {
    borderRadius: tokens.borderRadiusCircular,
    padding: `6px ${tokens.spacingHorizontalL}`,
  },
  tile: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '2px',
    padding: tokens.spacingHorizontalM,
  },
  choiceChecked: {
    border: `1px solid ${tokens.colorBrandStroke1}`,
    backgroundColor: tokens.colorBrandBackground2,
    boxShadow: `inset 0 0 0 1px ${tokens.colorBrandStroke1}`,
    ':hover': {
      border: `1px solid ${tokens.colorBrandStroke1}`,
    },
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: '1px',
    height: '1px',
    margin: 0,
    pointerEvents: 'none',
  },
  choiceHead: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    color: tokens.colorNeutralForeground1,
  },
  priorityDot: {
    width: '10px',
    height: '10px',
    flexShrink: 0,
    borderRadius: tokens.borderRadiusCircular,
  },
  presetNote: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    borderRadius: '10px',
    color: tokens.colorBrandForeground1,
    backgroundColor: tokens.colorBrandBackground2,
  },
  summary: {
    display: 'flex',
    flexDirection: 'column',
    margin: 0,
    padding: 0,
    listStyleType: 'none',
    borderRadius: '14px',
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
    overflow: 'hidden',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalM,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalL}`,
    ':not(:last-child)': {
      borderBottom: `1px solid ${tokens.colorNeutralStroke3}`,
    },
  },
  summaryValue: {
    minWidth: 0,
    textAlign: 'right',
    overflowWrap: 'anywhere',
  },
  actions: {
    display: 'flex',
    flexWrap: 'wrap-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalS,
    paddingTop: tokens.spacingVerticalL,
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  primary: {
    marginLeft: 'auto',
  },
});

/** Intitulé du rôle : le métier saisi pour un rôle personnalisé, sinon le libellé du rôle. */
function roleLabel({ role, customRole }: Preferences): string {
  if (!role) return '';
  if (role === 'custom') return customRole.trim() || ROLE_PRESETS.custom.label;
  return ROLE_PRESETS[role].label;
}

interface ChoiceProps {
  name: string;
  checked: boolean;
  onSelect: () => void;
  className?: string;
  children: ReactNode;
}

/** Bouton radio présenté comme une carte ou une pastille sélectionnable. */
function Choice({ name, checked, onSelect, className, children }: ChoiceProps) {
  const styles = useStyles();
  return (
    <label className={mergeClasses(styles.choice, className, checked && styles.choiceChecked)}>
      <input type="radio" name={name} className={styles.hiddenInput} checked={checked} onChange={onSelect} />
      {children}
    </label>
  );
}

interface OnboardingProps {
  initial: Preferences;
  /** `welcome` : introduction complète avant la connexion ; `edit` : directement les réglages. */
  mode: 'welcome' | 'edit';
  onComplete: (preferences: Preferences) => void;
  /** Ferme sans enregistrer (absent lors du tout premier lancement). */
  onCancel?: () => void;
}

export function Onboarding({ initial, mode, onComplete, onCancel }: OnboardingProps) {
  const styles = useStyles();
  const [step, setStep] = useState(mode === 'welcome' ? 0 : 1);
  const [prefs, setPrefs] = useState(initial);
  const root = useRef<HTMLDivElement>(null);
  const stepRef = useRef<HTMLDivElement>(null);
  const update = (patch: Partial<Preferences>) => setPrefs((current) => ({ ...current, ...patch }));
  const last = STEP_TITLES.length - 1;
  const firstName = prefs.firstName.trim();
  const company = prefs.companyName.trim();

  // Entrée de la carte, et halos du fond qui dérivent lentement.
  useGSAP(
    () => {
      if (reduceMotion()) return;
      gsap.from('[data-card]', { autoAlpha: 0, y: 24, scale: 0.98, duration: 0.7 });
      gsap.to('[data-orb]', {
        x: 'random(-40, 40)',
        y: 'random(-30, 30)',
        duration: 8,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      });
    },
    { scope: root },
  );

  // Chaque étape apparaît en cascade ; l'introduction révèle son titre mot à mot.
  useGSAP(
    () => {
      if (reduceMotion() || !stepRef.current) return;
      const tl = gsap.timeline();
      if (step === 0) {
        tl.from('[data-logo]', { scale: 0.5, rotate: -14, autoAlpha: 0, duration: 0.6, ease: 'back.out(2.2)' })
          .from('[data-word]', { autoAlpha: 0, y: 18, stagger: 0.07, duration: 0.5 }, '<0.15')
          .from('[data-reveal]', { autoAlpha: 0, y: 12, stagger: 0.08, duration: 0.45 }, '<0.2');
      } else {
        tl.from(stepRef.current.children, { autoAlpha: 0, y: 12, stagger: 0.06, duration: 0.45 });
      }
    },
    { scope: stepRef, dependencies: [step] },
  );

  const selectRole = (role: Role) => update({ role, ...ROLE_PRESETS[role].preset });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (step < last) setStep(step + 1);
    else onComplete({ ...prefs, firstName, companyName: company, customRole: prefs.customRole.trim() });
  };

  const delay = DELAYS.find((d) => d.days === prefs.reminderDays)?.label ?? `${prefs.reminderDays} jours`;
  const workWeek = WORK_WEEKS.find((w) => w.value === prefs.workWeek) ?? WORK_WEEKS[0];

  const heading = (title: string, lead: string) => (
    <div>
      <h1 id="onboarding-title" className={styles.title}>
        {title}
      </h1>
      <Body1 className={styles.lead}>{lead}</Body1>
    </div>
  );

  let content: ReactNode;
  if (step === 0) {
    content = (
      <>
        <span data-logo className={styles.logo}>
          <MailCheckmark24Filled />
        </span>
        <div>
          <Caption1 data-reveal className={styles.eyebrow}>
            Follow-up Manager pour Outlook
          </Caption1>
          <h1 id="onboarding-title" className={styles.hero} aria-label={INTRO_TITLE}>
            {INTRO_TITLE.split(' ').map((word, index) => (
              <span key={index} data-word className={styles.word} aria-hidden>
                {index > 0 ? ` ${word}` : word}
              </span>
            ))}
          </h1>
          <Body1 data-reveal className={styles.lead}>
            Transformez les emails qui attendent une réponse en suivis datés. Quelques questions sur vous et votre
            entreprise, et l’outil se règle tout seul.
          </Body1>
        </div>
        <ul data-reveal className={styles.features}>
          {[
            { icon: <Mail20Regular />, title: 'Repérez', text: 'Un email important devient un suivi en un clic.' },
            { icon: <CalendarClock20Regular />, title: 'Planifiez', text: 'Échéance, priorité et notes au même endroit.' },
            { icon: <Warning20Regular />, title: 'Relancez', text: 'Les suivis en retard remontent tout seuls.' },
          ].map((feature) => (
            <li key={feature.title} className={styles.feature}>
              <span className={styles.featureIcon}>{feature.icon}</span>
              <Text weight="semibold">{feature.title}</Text>
              <Caption1 className={styles.muted}>{feature.text}</Caption1>
            </li>
          ))}
        </ul>
        <div data-reveal className={styles.reassurance}>
          <Caption1 className={styles.reassuranceItem}>
            <Sparkle16Regular aria-hidden />
            Environ 1 minute
          </Caption1>
          <Caption1 className={styles.reassuranceItem}>
            <Eye16Regular aria-hidden />
            Lecture seule dans Outlook
          </Caption1>
          <Caption1 className={styles.reassuranceItem}>
            <LockClosed16Regular aria-hidden />
            Réglages gardés sur cet appareil
          </Caption1>
        </div>
      </>
    );
  } else if (step === 1) {
    const preset = prefs.role ? ROLE_PRESETS[prefs.role] : null;
    content = (
      <>
        {heading('Faisons connaissance', 'Votre métier nous permet de pré-régler les relances à votre rythme.')}
        <Field label="Votre prénom">
          <Input
            autoFocus
            size="large"
            contentBefore={<Person20Regular />}
            placeholder="Ex. : Camille"
            value={prefs.firstName}
            onChange={(_, data) => update({ firstName: data.value })}
            autoComplete="given-name"
          />
        </Field>
        <fieldset className={styles.group}>
          <legend className={styles.legend}>
            <Text weight="semibold">Votre rôle</Text>
          </legend>
          <div className={styles.choices}>
            {ROLES.map((role) => (
              <Choice
                key={role}
                name="role"
                className={styles.tile}
                checked={prefs.role === role}
                onSelect={() => selectRole(role)}
              >
                <Text weight="semibold">{ROLE_PRESETS[role].label}</Text>
                <Caption1 className={styles.muted}>{ROLE_PRESETS[role].hint}</Caption1>
              </Choice>
            ))}
          </div>
        </fieldset>
        {prefs.role === 'custom' && (
          <Field label="Votre métier" hint="Vous réglerez vous-même vos relances dans deux étapes.">
            <Input
              autoFocus
              size="large"
              contentBefore={<PersonEdit20Regular />}
              placeholder="Ex. : Responsable RH, juriste, comptable…"
              value={prefs.customRole}
              onChange={(_, data) => update({ customRole: data.value })}
              autoComplete="organization-title"
            />
          </Field>
        )}
        {preset?.preset && (
          <Caption1 className={styles.presetNote}>
            <Sparkle16Regular aria-hidden />
            Réglages recommandés pour « {preset.label} » appliqués, ajustables dans deux étapes.
          </Caption1>
        )}
      </>
    );
  } else if (step === 2) {
    content = (
      <>
        {heading('Votre entreprise', 'Pour personnaliser votre espace et ne jamais planifier une relance un jour chômé.')}
        <Field label="Nom de l’entreprise">
          <Input
            autoFocus
            size="large"
            contentBefore={<Building20Regular />}
            placeholder="Ex. : Devpoint"
            value={prefs.companyName}
            onChange={(_, data) => update({ companyName: data.value })}
            autoComplete="organization"
          />
        </Field>
        <fieldset className={styles.group}>
          <legend className={styles.legend}>
            <Text weight="semibold">Jours travaillés</Text>
          </legend>
          <div className={styles.choices}>
            {WORK_WEEKS.map(({ value, label, hint }) => (
              <Choice
                key={value}
                name="workWeek"
                className={styles.tile}
                checked={prefs.workWeek === value}
                onSelect={() => update({ workWeek: value })}
              >
                <Text weight="semibold">{label}</Text>
                <Caption1 className={styles.muted}>{hint}</Caption1>
              </Choice>
            ))}
          </div>
        </fieldset>
      </>
    );
  } else if (step === 3) {
    content = (
      <>
        {heading('Vos relances', 'Proposées à chaque nouveau suivi, toujours modifiables au cas par cas.')}
        <fieldset className={styles.group}>
          <legend className={styles.legend}>
            <Text weight="semibold">Relancer par défaut au bout de</Text>
          </legend>
          <div className={styles.chips}>
            {DELAYS.map(({ days, label }) => (
              <Choice
                key={days}
                name="reminderDays"
                className={styles.chip}
                checked={prefs.reminderDays === days}
                onSelect={() => update({ reminderDays: days })}
              >
                <Text weight={prefs.reminderDays === days ? 'semibold' : 'regular'}>{label}</Text>
              </Choice>
            ))}
          </div>
        </fieldset>
        <fieldset className={styles.group}>
          <legend className={styles.legend}>
            <Text weight="semibold">Priorité par défaut</Text>
          </legend>
          <div className={styles.choices}>
            {(['high', 'normal', 'low'] as Priority[]).map((priority) => (
              <Choice
                key={priority}
                name="defaultPriority"
                checked={prefs.defaultPriority === priority}
                onSelect={() => update({ defaultPriority: priority })}
              >
                <span className={styles.priorityDot} style={{ backgroundColor: PRIORITY_DOTS[priority] }} aria-hidden />
                <Text weight="medium">{PRIORITY_LABELS[priority]}</Text>
              </Choice>
            ))}
          </div>
        </fieldset>
        <fieldset className={styles.group}>
          <legend className={styles.legend}>
            <Text weight="semibold">Afficher à l’ouverture</Text>
          </legend>
          <div className={styles.choices}>
            {START_VIEWS.map(({ value, Icon, hint }) => (
              <Choice
                key={value}
                name="startView"
                className={styles.tile}
                checked={prefs.startView === value}
                onSelect={() => update({ startView: value })}
              >
                <span className={styles.choiceHead}>
                  <Icon />
                  <Text weight="semibold">{VIEW_LABELS[value]}</Text>
                </span>
                <Caption1 className={styles.muted}>{hint}</Caption1>
              </Choice>
            ))}
          </div>
        </fieldset>
      </>
    );
  } else {
    const rows: [string, string][] = [
      ['Vous', [firstName, roleLabel(prefs)].filter(Boolean).join(' · ') || '—'],
      ['Entreprise', company || '—'],
      ['Jours travaillés', workWeek.label],
      ['Relance par défaut', delay],
      ['Priorité par défaut', PRIORITY_LABELS[prefs.defaultPriority]],
      ['À l’ouverture', VIEW_LABELS[prefs.startView]],
    ];
    content = (
      <>
        {heading(
          firstName ? `C’est prêt, ${firstName} !` : 'C’est prêt !',
          mode === 'welcome'
            ? 'Connectez maintenant votre boîte Outlook. Ces réglages restent modifiables depuis le menu de votre compte.'
            : 'Vérifiez vos réglages avant de les enregistrer.',
        )}
        <ul className={styles.summary}>
          {rows.map(([label, value]) => (
            <li key={label} className={styles.summaryRow}>
              <Text className={styles.muted}>{label}</Text>
              <Text weight="semibold" className={styles.summaryValue}>
                {value}
              </Text>
            </li>
          ))}
        </ul>
      </>
    );
  }

  return (
    <div ref={root} className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
      <span data-orb className={mergeClasses(styles.orb, styles.orbA)} aria-hidden />
      <span data-orb className={mergeClasses(styles.orb, styles.orbB)} aria-hidden />

      <form data-card className={styles.card} onSubmit={handleSubmit}>
        <div className={styles.top}>
          <div className={styles.progress} aria-label={`Étape ${step + 1} sur ${STEP_TITLES.length} : ${STEP_TITLES[step]}`}>
            {STEP_TITLES.map((title, index) => (
              <span
                key={title}
                className={mergeClasses(styles.dot, index === step && styles.dotActive, index < step && styles.dotDone)}
              />
            ))}
            <Caption1 className={styles.stepLabel}>{STEP_TITLES[step]}</Caption1>
          </div>
          {onCancel && (
            <Tooltip content="Fermer sans enregistrer" relationship="label">
              <Button appearance="subtle" icon={<Dismiss20Regular />} onClick={onCancel} />
            </Tooltip>
          )}
        </div>

        <div ref={stepRef} key={step} className={styles.step}>
          {content}
        </div>

        <div className={styles.actions}>
          {step === 0 ? (
            <Button appearance="subtle" onClick={() => onComplete(prefs)}>
              Passer l’introduction
            </Button>
          ) : (
            (step > 1 || mode === 'welcome') && (
              <Button appearance="subtle" icon={<ArrowLeft20Regular />} onClick={() => setStep(step - 1)}>
                Retour
              </Button>
            )
          )}
          <Button
            data-sound="click"
            type="submit"
            className={styles.primary}
            appearance="primary"
            size="large"
            icon={step < last ? <ArrowRight20Regular /> : <Checkmark20Regular />}
            iconPosition={step < last ? 'after' : 'before'}
          >
            {step === 0
              ? 'Commencer'
              : step < last
                ? 'Continuer'
                : mode === 'welcome'
                  ? 'Continuer vers la connexion'
                  : 'Enregistrer'}
          </Button>
        </div>
      </form>
    </div>
  );
}
