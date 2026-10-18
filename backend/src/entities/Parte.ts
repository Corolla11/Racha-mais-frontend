import {StatusAndamento} from "./Tarefa.js";

export class Parte {
    private _idUser: string;
    private _idTarefa: string;
    private _descricao: string;
    private _valor: number;
    private _status: StatusAndamento;

    constructor(idUser: string, idTarefa: string, descricao: string, valor: number, status: StatusAndamento) {
        this._idUser = idUser;
        this._idTarefa = idTarefa;
        this._descricao = descricao;
        this._valor = valor;
        this._status = status;
    }


    get idUser(): string {
        return this._idUser;
    }

    set idUser(value: string) {
        this._idUser = value;
    }

    get idTarefa(): string {
        return this._idTarefa;
    }

    set idTarefa(value: string) {
        this._idTarefa = value;
    }

    get descricao(): string {
        return this._descricao;
    }

    set descricao(value: string) {
        this._descricao = value;
    }

    get valor(): number {
        return this._valor;
    }

    set valor(value: number) {
        this._valor = value;
    }

    get status(): StatusAndamento {
        return this._status;
    }

    set status(value: StatusAndamento) {
        this._status = value;
    }
}