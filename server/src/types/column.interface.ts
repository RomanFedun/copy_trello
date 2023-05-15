import { Schema, Document } from 'mongoose';

export interface Column {
	title: string;
	createdAt: Date;
	updatedAt: Date;
	boardId: Schema.Types.ObjectId;
	userId: Schema.Types.ObjectId;
}

export interface ColumnDocument extends Document, Column {

}