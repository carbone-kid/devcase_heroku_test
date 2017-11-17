export const USER_GROUPS = [
  [
    {
      name: 'Recruiters',
      id: 1,
      key: 'recruiter'
    },
    {
      name: 'Technical officers',
      id: 2,
      key: 'reviewer'
    },
    {
      name: 'Admins',
      id: 3,
      key: 'admin'
    }
  ],
  [
    {
      name: 'Recruiters',
      id: 1,
      key: 'recruiter'
    }
  ],
  [
    {
      name: 'Recruiters',
      id: 1,
      key: 'recruiter'
    },
    {
      name: 'Technical officers',
      id: 2,
      key: 'reviewer'
    }
  ],
  [
    {
      name: 'Recruiters',
      id: 1,
      key: 'recruiter'
    },
    {
      name: 'Technical officers',
      id: 2,
      key: 'reviewer'
    },
    {
      name: 'Admins',
      id: 3,
      key: 'admin'
    }
  ]
];
/*
'roleId': {
    'stageId': 'templateId',
    'stageId': 'templateId'
}
*/
export const ROLES_STAGES_TEMPLATES = {
  '1': {
    '1': '1'
  },
  '2': {
    '2': '3',
    '3': '4'
  },
  '3': {
    '2': '3',
    '3': '4',
    '4': '5',
  },
  '4': {
    '1': '2',
    '2': '3',
    '3': '4',
    '4': '5',
  }
};

export const STAGES = {
  items: [
    {name: 'Repository created', id: 1},
    {name: 'Solution available', id: 2},
    {name: 'Review complete', id: 3},
    {name: 'Archived', id: 4}
  ],
  byId: {
    '1': {name: 'Repository created', id: 1},
    '2': {name: 'Solution available', id: 2},
    '3': {name: 'Review complete', id: 3},
    '4': {name: 'Archived', id: 4}
  }
};
