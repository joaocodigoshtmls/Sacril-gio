interface AuthConfig {
  providers: {
    google?: boolean;
    credentials: boolean;
  };
  callbacks: {
    signIn: (user: any) => Promise<boolean>;
    session: (session: any) => Promise<any>;
  };
}

const authConfig: AuthConfig = {
  providers: {
    google: true,
    credentials: true,
  },
  callbacks: {
    signIn: async (user) => {
      // Implementar lógica de validação do login
      return true;
    },
    session: async (session) => {
      // Adicionar dados customizados à sessão
      return session;
    },
  },
};

export default authConfig;
