
type itemData = {
    id: string,
    title: string,
    description: string,
    image: string
  }

export const DATA: itemData[] = [
    {
      id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
      title: 'Bem-vindo ao MarketList!',
      description: 'Organize suas compras de forma rápida e eficiente. Comece criando sua primeira lista!',
      image: require('../assets/images/posts.png')
    },
    {
      id: '3ac68afc-c605-48d3-a4f8-fbd91aa97f63',
      title: 'Crie listas personalizadas',
      description: 'Adicione seus itens favoritos ou descubra novas sugestões. Manter a despensa abastecida nunca foi tão fácil!',
      image: require('../assets/images/Notelist.png')
    },
    {
      id: '58694a0f-3da1-471f-bd96-145571e29d72',
      title: 'Economize tempo e dinheiro',
      description: 'Planeje suas compras com antecedência, compare preços e evite esquecimentos com nossa lista.',
      image: require('../assets/images/EmptyCart.png')
    },
    {
      id: '58784a0f-3da1-761f-bd96-145571bgaArS',
      title: 'Suas listas, sempre à mão',
      description: 'Acesse suas listas em qualquer lugar e a qualquer momento, mesmo sem conexão à internet.',
      image: require('../assets/images/Begin.png')
    },
  ];