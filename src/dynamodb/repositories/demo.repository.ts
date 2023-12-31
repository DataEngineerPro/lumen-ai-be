import { Contact, Extractions, Label } from 'src/demo/models/model';
import { DynamoDBRepository } from '../dynamodb.decorator';
import { BaseRepository } from './base.repository';
import { Record, Document } from 'src/demo/models/model';

export interface Demo {
  id: string;
}

enum UpdateEntity {
  Customer = 'customer',
  Label = 'labels',
  Document = 'documents',
  Extractions = 'extractions',
}

@DynamoDBRepository()
export class DemoRepository extends BaseRepository<Record> {
  protected tableName = 'lumenai_demo';

  getById(id: string): Promise<Record | null> {
    return this.get({ id });
  }

  getAll(): Promise<Record[]> {
    return this.getAllDocuments();
  }

  createContact(contact: Contact): Promise<any> {
    return this.create(contact);
  }

  updateContact(contact: Partial<Contact>, id?: string): Promise<any> {
    return this.updateItem(contact, UpdateEntity.Customer, id);
  }

  updateLabels(labels: Partial<Label>, id: string, key?: string): Promise<any> {
    return this.updateMap(labels, UpdateEntity.Label, id, key);
  }

  updateDocument(
    document: Partial<Document>,
    id: string,
    key?: string,
  ): Promise<any> {
    return this.updateMap(document, UpdateEntity.Document, id, key);
  }

  updateExtractions(
    extractions: Partial<Extractions>,
    id: string,
    key?: string,
  ): Promise<any> {
    return this.updateMap(extractions, UpdateEntity.Extractions, id, key);
  }

  bulkLoadDocuments(documents: any, id: string): Promise<any> {
    return this.bulkLoadItem(documents, UpdateEntity.Document, id);
  }
}
