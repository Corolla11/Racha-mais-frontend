export enum TipoTarefa {
    comum,
    contribuinte,
    meta,
    recorrente
}

export enum StatusAndamento {
    AGENDADA,
    EM_ANDAMENTO,
    FINALIZADA,
    ATRASADA,
    CANCELADA
}

export class Tarefa {
    private _id: string;
    private _idGrupo: string;
    private _idUser: string;
    private _nome: string;
    private _descricao: string;
    private _valorTotal: number; // mudar para o tipo Decimal do Prisma depois
    private _dataInicio: Date;
    private _dataFinal: Date;
    private _tipoTarefa: TipoTarefa;
    private _statusAndamento: StatusAndamento;


    constructor(id: string, idGrupo: string, idUser: string, nome: string, descricao: string, valorTotal: number, dataInicio: Date, prazoTotal: Date, tipoTarefa: TipoTarefa, statusAndamento: StatusAndamento) {
        this._id = id;
        this._idGrupo = idGrupo;
        this._idUser = idUser;
        this._nome = nome;
        this._descricao = descricao;
        this._valorTotal = valorTotal;
        this._dataInicio = dataInicio;
        this._dataFinal = prazoTotal;
        this._tipoTarefa = tipoTarefa;
        this._statusAndamento = statusAndamento;
    }


    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value;
    }

    get idGrupo(): string {
        return this._idGrupo;
    }

    set idGrupo(value: string) {
        this._idGrupo = value;
    }

    get idUser(): string {
        return this._idUser;
    }

    set idUser(value: string) {
        this._idUser = value;
    }

    get nome(): string {
        return this._nome;
    }

    set nome(value: string) {
        this._nome = value;
    }

    get descricao(): string {
        return this._descricao;
    }

    set descricao(value: string) {
        this._descricao = value;
    }

    get valorTotal(): number {
        return this._valorTotal;
    }

    set valorTotal(value: number) {
        this._valorTotal = value;
    }

    get dataInicio(): Date {
        return this._dataInicio;
    }

    set dataInicio(value: Date) {
        this._dataInicio = value;
    }

    get dataFinal(): Date {
        return this._dataFinal;
    }

    set dataFinal(value: Date) {
        this._dataFinal = value;
    }

    get tipoTarefa(): TipoTarefa {
        return this._tipoTarefa;
    }

    set tipoTarefa(value: TipoTarefa) {
        this._tipoTarefa = value;
    }

    get statusAndamento(): StatusAndamento {
        return this._statusAndamento;
    }

    set statusAndamento(value: StatusAndamento) {
        this._statusAndamento = value;
    }
}