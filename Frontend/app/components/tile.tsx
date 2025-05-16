import dog from "./dog.jpeg"
type tileProps = {
    name?: string;
    title?: string;
    desc?: string;
  };
  
  export default function Tile({ name, title, desc }: tileProps) {
    return(
      <div className="w-60 h-100 bg-gradient-to-br from-emerald-800 via-emerald-600 to-emerald-500 rounded-sm p-12 m-10 transition-opacity duration-300 opacity-100 hover:opacity-80 hover:cursor-pointer hover:translate(">
        <center>
        <img src={dog.src} className="w-20 rounded-full" />
        </center>
        <center>
          <h1 className="font-coolvetica text-3xl">{name}</h1>
          <br>
          </br>
          <h3 className="font-coolvetica text-m">{title}</h3>
          <br>
          </br>
          <p className="font-sans">{desc}</p>
        </center>

      </div>
    );
  }