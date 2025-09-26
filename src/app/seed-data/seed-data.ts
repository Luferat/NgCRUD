import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { Firestore, collection, doc, writeBatch, getDocs } from '@angular/fire/firestore';

@Component({
  selector: 'app-seed-data',
  imports: [CommonModule],
  templateUrl: './seed-data.html',
  styleUrl: './seed-data.css'
})
export class SeedData {
  // Mensagem de feedback exibida na interface para o usuário.
  feedbackMessage: string | null = null;
  // Flag de carregamento para mostrar um spinner enquanto a operação está em andamento.
  isLoading = true;

  // IDs de proprietários atuais, disponíveis no Firebase Authentication
  // Edite essa lista conforme o(s) usuário(s) disponível(is) na lista do seu Firebase Authentication
  private owners = ['4j2oIn4DlqbS91MDgHr5l0HRwTf2', 't3CQISBwVWP0CAFrNMnVfFSXRaK2'];

  // O construtor injeta o serviço do Firestore para ter acesso ao banco de dados.
  constructor(private firestore: Firestore) {
    // O método é chamado automaticamente na inicialização do componente.
    this.checkAndSeedData();
  }

  /**
   * Verifica se a coleção 'Things' existe no Firestore.
   * Se não existir, a cria e a preenche com dados.
   * Em seguida, atualiza o status de carregamento e a mensagem de feedback.
   */
  async checkAndSeedData() {
    try {
      const thingsCollection = collection(this.firestore, 'Things');
      // Tenta obter os documentos da coleção.
      const querySnapshot = await getDocs(thingsCollection);

      // Se o querySnapshot estiver vazio, a coleção não existe.
      if (querySnapshot.empty) {
        await this.seedData();
        this.feedbackMessage = 'Coleção "Things" criada e populada com 15 itens!';
      } else {
        this.feedbackMessage = 'A coleção "Things" já existe. Nenhuma ação foi necessária.';
      }
    } catch (error) {
      // Em caso de erro, exibe a mensagem no console e na interface.
      console.error('Erro ao verificar ou criar dados:', error);
      this.feedbackMessage = 'Ocorreu um erro ao processar a solicitação.';
    } finally {
      // O `finally` garante que o `isLoading` será sempre definido como `false`.
      this.isLoading = false;
    }
  }

  /**
   * Cria um lote de 15 documentos de teste e os salva no Firestore.
   * Usa `writeBatch` para garantir que todas as operações sejam atômicas (ou todas sucedem, ou todas falham).
   */
  private async seedData() {
    const batch = writeBatch(this.firestore);
    const thingsCollection = collection(this.firestore, 'Things');

    for (let i = 1; i <= 15; i++) {
      const randomDate = this.getRandomDate();
      const randomOwner = this.owners[Math.floor(Math.random() * this.owners.length)];

      // Dados do documento
      const thingData = {
        name: `Coisa Nº ${i}`,
        description: `Descrição completa e sem embaraços da coisa número ${i}.`,
        location: `Localização secreta e bem escondida da coisa ${i}`,
        photoURL: `https://picsum.photos/400/300?random=${i}`,
        createdAt: randomDate,
        owner: randomOwner,
        status: 'ON',
        metadata: {}
      };

      // Cria uma nova referência de documento e adiciona a operação ao lote.
      const newDocRef = doc(thingsCollection);
      batch.set(newDocRef, thingData);
    }

    // Comita o lote, salvando todos os documentos de uma vez.
    await batch.commit();
  }

  /**
   * Gera uma data aleatória entre a data atual e 6 meses atrás.
   */
  private getRandomDate(): string {
    const today = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(today.getMonth() - 6);

    const randomTimestamp = sixMonthsAgo.getTime() + Math.random() * (today.getTime() - sixMonthsAgo.getTime());
    return new Date(randomTimestamp).toISOString();
  }
}