import IconCalendar from '../../../components/IconCalendar.vue';
import IconOrganization from '../../../components/IconOrganization.vue';
import IconHoldingHands from '../../../components/IconHoldingHands.vue';
import IconUser from '../../../components/IconUser.vue';
import IconActivePerson from '../../../components/IconActivePerson.vue';

export const POC_DEPARTMENTS = ['apen-by', 'mayn-sitt-omrade'];

export const KEY_FIGURES = [
  {
    id: 'reservations',
    name: {
      'nb-NO': 'Reservasjoner',
      'en-US': 'Reservations',
    },
    value: 23418,
    icon: IconCalendar,
  },
  {
    id: 'participations',
    name: {
      'nb-NO': 'Deltakelser',
      'en-US': 'Participations',
    },
    value: 181000,
    icon: IconOrganization,
  },
  {
    id: 'weddings',
    name: {
      'nb-NO': 'Vielser',
      'en-US': 'Weddings',
    },
    value: 3338,
    icon: IconHoldingHands,
  },
  {
    id: 'userProfiles',
    name: {
      'nb-NO': 'Brukerprofiler',
      'en-US': 'User profiles',
    },
    value: 153101,
    icon: IconUser,
  },
  {
    id: 'activeUserProfiles',
    name: {
      'nb-NO': 'Aktive brukerprofiler',
      'en-US': 'Active user profiles',
    },
    value: 71857,
    icon: IconActivePerson,
  },
];

export const KPI_TARGETS = {
  '5CSm8fPvBCm7wbRSgOge': {
    value: 0.8,
    name: {
      'nb-NO': 'Mål for 2022',
      'en-US': 'Target for 2022',
    },
  },
  j8go8Qn4kxh5K8hYj28K: {
    // Åpen by, Kulturtimer
    value: 1300000,
    name: {
      'nb-NO': 'Mål for 2022',
      'en-US': 'Target for 2022',
    },
  },
  // '***': { // TODO: Åpen by, Meråpne dåråpninger
  //   value: 50000,
  //   name: {
  //     'nb-NO': 'Mål for 2022',
  //     'en-US': 'Target for 2022',
  //   },
  // },
};
