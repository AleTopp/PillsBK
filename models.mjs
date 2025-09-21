import dayjs from 'dayjs';

function Farmaco(id, nome, dosaggio, indicazioni, mesi_esclusi, ordine) {
    this.id = id;
    this.nome = nome;
    this.dosaggio = dosaggio;
    this.indicazioni = indicazioni;
    this.mesi_esclusi = mesi_esclusi.split(',').map(s => s.trim());
    this.ordine = ordine
    this.assunzioni = null;
}

function Assunzione(id, timestamp, farmaco, stato) {
    this.id = id;
    this.timestamp = dayjs(timestamp);
    this.farmaco = farmaco;
    if (stato >= 0 && stato <= 3)
        this.stato = stato;
    else 
        throw new Error("Invalid stato");
}

export { Farmaco, Assunzione };