import { ApiProperty } from '@nestjs/swagger';

export class Contact {

    @ApiProperty()
    name: string;

    @ApiProperty()
    workemail: string;

    @ApiProperty()
    phone: string;

    @ApiProperty()
    company: string;

    @ApiProperty()
    country: string;

    @ApiProperty()
    usecase?: string;

    @ApiProperty()
    comments?: string;

}

export class Label {
    @ApiProperty()
    name: string;

    @ApiProperty()
    color: string;

}

export class Document {
    @ApiProperty()
    page: string;

    @ApiProperty()
    displayUrl: string;

    @ApiProperty()
    url: string;
}

export class Extractions {
    @ApiProperty()
    label: string;

    @ApiProperty()
    document: string;

    @ApiProperty()
    left: number;

    @ApiProperty()
    top: number;


    @ApiProperty()
    height: number;

    @ApiProperty()
    width: number;

    @ApiProperty()
    extractedText: string;

    @ApiProperty()
    userEnteredText: string;

    @ApiProperty()
    comments: string;
}

export class Record {
    id: string;
    customer: Contact;
    labels: { [id: string]: Label };
    documents: { [id: string]: Document };
    extractions: { [id: string]: Extractions};
}