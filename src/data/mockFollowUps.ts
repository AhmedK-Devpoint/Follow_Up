import type { Contact, FollowUp } from '../types/followUp';
import { toDateOnly } from '../utils/dates';

/**
 * Données fictives de démonstration. Les dates sont relatives au jour courant
 * afin que les échéances (en retard, cette semaine…) restent pertinentes.
 * Tous les contacts et domaines sont inventés.
 */

const me: Contact = { name: 'Moi', email: 'moi@contoso.example' };

function dueIn(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toDateOnly(date);
}

function receivedDaysAgo(days: number, hour: number, minute = 0): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

type DemoItem = Omit<FollowUp, 'source' | 'createdAt'>;

const demoItems: DemoItem[] = [
  {
    id: 'fu-001',
    sender: { name: 'Claire Martin', email: 'claire.martin@northwind.example' },
    recipients: [me],
    subject: 'Validation du devis — Refonte intranet',
    preview: 'Bonjour, pourriez-vous me confirmer la validation du devis avant vendredi ?',
    body: `Bonjour,

Pourriez-vous me confirmer la validation du devis n° D-2041 avant vendredi ? Sans retour de votre part, nous ne pourrons pas bloquer l'équipe pour le lancement prévu le mois prochain.

Je reste disponible pour un point téléphonique si besoin.

Bien cordialement,
Claire Martin
Responsable commerciale — Northwind`,
    receivedAt: receivedDaysAgo(6, 9, 14),
    dueDate: dueIn(-2),
    priority: 'high',
    status: 'waiting',
    notes: [
      {
        id: 'n-001',
        text: 'Relance envoyée par téléphone, en attente du retour de la direction financière.',
        createdAt: receivedDaysAgo(3, 15, 30),
      },
    ],
  },
  {
    id: 'fu-002',
    sender: { name: 'Julien Bernard', email: 'j.bernard@fabrikam.example' },
    recipients: [me, { name: 'Équipe Projet', email: 'projet@contoso.example' }],
    subject: 'Compte rendu comité de pilotage — actions à mener',
    preview: 'Vous trouverez ci-joint le compte rendu. Trois actions vous sont attribuées.',
    body: `Bonjour à tous,

Vous trouverez ci-joint le compte rendu du comité de pilotage de mardi.

Actions qui vous sont attribuées :
1. Mettre à jour le planning de déploiement
2. Confirmer la disponibilité des utilisateurs pilotes
3. Transmettre la matrice des risques actualisée

Merci de revenir vers moi d'ici la fin de semaine.

Julien`,
    receivedAt: receivedDaysAgo(2, 17, 42),
    dueDate: dueIn(1),
    priority: 'high',
    status: 'todo',
    notes: [],
  },
  {
    id: 'fu-003',
    sender: { name: 'Sophie Laurent', email: 'sophie.laurent@contoso.example' },
    recipients: [me],
    subject: 'Contrat de maintenance 2027',
    preview: "Le service juridique attend vos remarques sur l'annexe B avant signature.",
    body: `Bonjour,

Le service juridique attend vos remarques sur l'annexe B (niveaux de service) avant de transmettre le contrat pour signature.

Pouvez-vous les envoyer directement à Marc en me mettant en copie ?

Merci,
Sophie`,
    receivedAt: receivedDaysAgo(9, 11, 5),
    dueDate: dueIn(-5),
    priority: 'normal',
    status: 'todo',
    notes: [],
  },
  {
    id: 'fu-004',
    sender: { name: 'Thomas Petit', email: 'thomas.petit@adatum.example' },
    recipients: [me],
    subject: 'Relance facture F-2026-118',
    preview: "Sauf erreur de notre part, la facture F-2026-118 reste impayée à ce jour.",
    body: `Madame, Monsieur,

Sauf erreur de notre part, la facture F-2026-118 d'un montant de 4 820 € HT reste impayée à ce jour.

Nous vous remercions de bien vouloir procéder au règlement ou de nous indiquer la date de paiement prévue.

Cordialement,
Thomas Petit
Service comptabilité — Adatum`,
    receivedAt: receivedDaysAgo(0, 8, 47),
    dueDate: dueIn(0),
    priority: 'high',
    status: 'todo',
    notes: [],
  },
  {
    id: 'fu-005',
    sender: { name: 'Camille Robert', email: 'camille.robert@contoso.example' },
    recipients: [me],
    subject: 'Recrutement — retour sur les candidats',
    preview: 'As-tu pu regarder les trois profils transmis lundi ?',
    body: `Salut,

As-tu pu regarder les trois profils transmis lundi pour le poste de chef de projet ? J'aimerais caler les entretiens la semaine prochaine.

Un retour rapide m'aiderait beaucoup.

Camille — RH`,
    receivedAt: receivedDaysAgo(3, 10, 20),
    dueDate: dueIn(3),
    priority: 'normal',
    status: 'todo',
    notes: [],
  },
  {
    id: 'fu-006',
    sender: { name: 'Nicolas Durand', email: 'n.durand@tailspin.example' },
    recipients: [me],
    subject: 'Proposition de partenariat',
    preview: 'Suite à notre échange au salon, je vous envoie notre proposition détaillée.',
    body: `Bonjour,

Suite à notre échange au salon, je vous envoie notre proposition de partenariat détaillée.

J'attends votre retour pour organiser une réunion avec nos équipes techniques.

Bien à vous,
Nicolas Durand
Tailspin Partners`,
    receivedAt: receivedDaysAgo(5, 14, 0),
    dueDate: dueIn(6),
    priority: 'low',
    status: 'waiting',
    notes: [
      {
        id: 'n-002',
        text: 'Proposition transmise à la direction, réponse attendue sous une semaine.',
        createdAt: receivedDaysAgo(4, 9, 10),
      },
    ],
  },
  {
    id: 'fu-007',
    sender: { name: 'Emma Moreau', email: 'emma.moreau@contoso.example' },
    recipients: [me],
    subject: 'Budget T4 — chiffres manquants',
    preview: 'Il me manque encore les prévisions de ton équipe pour consolider le budget.',
    body: `Bonjour,

Il me manque encore les prévisions de ton équipe pour consolider le budget du T4. La revue avec la direction est prévue dans quelques jours.

Merci d'avance,
Emma — Contrôle de gestion`,
    receivedAt: receivedDaysAgo(4, 16, 35),
    dueDate: dueIn(-1),
    priority: 'high',
    status: 'todo',
    notes: [],
  },
  {
    id: 'fu-008',
    sender: { name: 'Lucas Simon', email: 'lucas.simon@woodgrove.example' },
    recipients: [me],
    subject: 'Accès à la plateforme de test',
    preview: 'Nous avons créé vos comptes. Merci de confirmer la bonne réception des accès.',
    body: `Bonjour,

Nous avons créé vos comptes sur la plateforme de recette. Merci de confirmer la bonne réception des accès et de nous signaler tout problème de connexion.

Lucas Simon
Support Woodgrove`,
    receivedAt: receivedDaysAgo(1, 13, 12),
    dueDate: dueIn(4),
    priority: 'low',
    status: 'waiting',
    notes: [],
  },
  {
    id: 'fu-009',
    sender: { name: 'Léa Michel', email: 'lea.michel@contoso.example' },
    recipients: [me],
    subject: 'Présentation client — relecture',
    preview: 'Peux-tu relire la présentation avant la réunion de jeudi ?',
    body: `Hello,

Peux-tu relire la présentation avant la réunion de jeudi ? Surtout la partie chiffrée, slides 8 à 12.

Merci !
Léa`,
    receivedAt: receivedDaysAgo(1, 9, 3),
    dueDate: dueIn(2),
    priority: 'normal',
    status: 'todo',
    notes: [],
  },
  {
    id: 'fu-010',
    sender: { name: 'Hugo Lefèvre', email: 'hugo.lefevre@litware.example' },
    recipients: [me],
    subject: 'Commande de licences supplémentaires',
    preview: 'Nous attendons le bon de commande signé pour activer les 25 licences.',
    body: `Bonjour,

Nous attendons le bon de commande signé pour activer les 25 licences supplémentaires.

Dès réception, l'activation se fera sous 24 h.

Hugo Lefèvre
Litware`,
    receivedAt: receivedDaysAgo(12, 10, 0),
    dueDate: dueIn(-3),
    priority: 'normal',
    status: 'done',
    completedAt: receivedDaysAgo(2, 11, 15),
    notes: [
      {
        id: 'n-003',
        text: 'Bon de commande signé et renvoyé.',
        createdAt: receivedDaysAgo(2, 11, 15),
      },
    ],
  },
  {
    id: 'fu-011',
    sender: { name: 'Manon Garcia', email: 'manon.garcia@contoso.example' },
    recipients: [me],
    subject: 'Planning des congés de fin d’année',
    preview: 'Merci de valider le planning des congés de ton équipe.',
    body: `Bonjour,

Merci de valider le planning des congés de fin d'année de ton équipe dans l'outil RH.

Manon`,
    receivedAt: receivedDaysAgo(8, 15, 50),
    dueDate: dueIn(-6),
    priority: 'low',
    status: 'done',
    completedAt: receivedDaysAgo(5, 17, 0),
    notes: [],
  },
  {
    id: 'fu-012',
    sender: { name: 'Antoine Roux', email: 'antoine.roux@fourthcoffee.example' },
    recipients: [me],
    subject: 'Audit sécurité — plan de remédiation',
    preview: 'Pouvez-vous nous transmettre le plan de remédiation suite à l’audit ?',
    body: `Bonjour,

Suite à l'audit de sécurité du mois dernier, pouvez-vous nous transmettre le plan de remédiation avec les responsables et les dates cibles pour chaque point ?

Cordialement,
Antoine Roux
Fourth Coffee — RSSI`,
    receivedAt: receivedDaysAgo(7, 8, 30),
    dueDate: dueIn(9),
    priority: 'high',
    status: 'waiting',
    notes: [],
  },
];

/** Uniquement pour le mode démonstration : jamais mélangé aux emails Outlook. */
export function createDemoFollowUps(): FollowUp[] {
  return demoItems.map((item) => ({ ...item, source: 'demo', createdAt: item.receivedAt }));
}
