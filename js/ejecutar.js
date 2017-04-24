function buscarPrincipal(raiz) {
  for (var i = 0; i < raiz.hijos.length; i++) {
    if(raiz.hijos[i].nombre === "PRINCIPAL")
      return raiz.hijos[i];
  }
  return null;
}

function ejecutarArbol(nodo) {
  var cuerpo = nodo.hijos[0];
  console.log("ejecutarArbol");
  console.log(cuerpo);
  for (var i = 0; i < cuerpo.hijos.length; i++) {
    console.log("hijo[" + i + "]");
    console.log(cuerpo.hijos[i]);
    switch(cuerpo.hijos[i].nombre)
    {
      case "ASIGNACION":
        console.log("ASIGNACION");
        var asig = cuerpo.hijos[i];
        var val = evaluarValor(asig.hijos[1]);
        console.log(val);
        break;
      case "SI":
        // console.log("SI");
        // var si = cuerpo.hijos[i];
        // var val = evaluarValor(si.hijos[0]);
        break;
    }
  }
}

function evaluarValor(valor) {
  switch(valor.nombre)
  {
    case "+":
    case "*":
    case "/":
    case "%":
    case "^":
      var op1 = evaluarValor(valor.hijos[0]);
      var op2 = evaluarValor(valor.hijos[1]);
      return ejecutarAritmetica(op1, op2, valor.nombre);
      break;
    case "-":
      var op1 = evaluarValor(valor.hijos[0]);
      var op2 = ""
      var codigo = "";
      var t = getTemp();
      var res = {temp : "tx", tipo : -1};
      if(valor.hijos.length == 1)
      {
        switch(op1.tipo)
        {
          case 1://- numero
          case 7://- bool
            codigo = t + " = -" + op1.temp + ";";
            agregar3d(codigo);
            res.temp = t;
            res.tipo = 1;
            break;
          case 3://-cadena
          default:
            //error estos valores no se pueden operar
            var er = {
              tipo: "Error Semantico",
              descripcion: "No se pudo operar -[" + getTipo(op1.tipo) + "]"
            };
            agregarError(er);
            break;
        }
      }
      else
      {
        op2 = evaluarValor(valor.hijos[1]);
        switch(op1.tipo + op2.tipo)
        {
          case 2://numero - numero
          case 8://numero - bool
            codigo = t + " = " + op1.temp + " " + valor.nombre + " " + op2.temp + ";";
            agregar3d(codigo);
            res.temp = t;
            res.tipo = 1;
            break;
          case 4://numero - cadena
          case 6://cadena - cadena
          case 10://cadena - bool
          case 14://bool - bool
          default:
            //error estos valores no se pueden operar
            var er = {
              tipo: "Error Semantico",
              descripcion: "No se pudo operar [" + getTipo(op1.tipo) + "] - [" + op2.tipo + "]"
            };
            agregarError(er);
            res.temp = "tx";
            res.tipo = -1;
            break;
        }
      }
      return res;
      break;
    case "==":
    case "!=":
    case ">":
    case "<":
    case ">=":
    case "<=":
      var op1 = evaluarValor(valor.hijos[0]);
      var op2 = evaluarValor(valor.hijos[1]);
      return ejecutarRelacional(op1, op2, valor.nombre);
      break;
    case "&&":
    case "&?":
    case "||":
    case "|?":
    case "|&":
    case "!":
      return ejecutarLogica(valor);
      break;
    case "numero":
        return {
          temp : valor.valor,
          tipo : 1
        };
      break;
    case "bool":
        if (valor.valor == "true")
          return {
            temp : "1",
            tipo : 7
          };
        else
          return {
            temp : "0",
            tipo : 7
          };
      break;
  }
}

function ejecutarAritmetica(op1, op2, operador) {
  var res = {temp : "tx", tipo : -1};
  var t = getTemp();
  switch(operador)
  {
    case "+":
      switch(op1.tipo + op2.tipo)
      {
        case 2://numero + numero
        case 8://numero + bool
        case 14://bool + bool
          var codigo = t + " = " + op1.temp + " " + operador + " " + op2.temp + ";";
          agregar3d(codigo);
          res.temp = t;
          res.tipo = 1;
          break;
        case 4://numero + cadena
        case 6://cadena + cadena
        case 10://cadena + bool
          //se realiza la concatenacion
          break;
      }
      break;
    case "*":
      switch(op1.tipo + op2.tipo)
      {
        case 2://numero * numero
        case 8://numero * bool
        case 14://bool * bool
          var codigo = t + " = " + op1.temp + " " + operador + " " + op2.temp + ";";
          agregar3d(codigo);
          res.temp = t;
          res.tipo = 1;
          break;
        case 4://numero * cadena
        case 6://cadena * cadena
        case 10://cadena * bool
        default:
          //error estos valores no se pueden operar
          var er = {
            tipo: "Error Semantico",
            descripcion: "No se pudo operar [" + getTipo(op1.tipo) + "] " + operador + " [" + op2.tipo + "]"
          };
          agregarError(er);
          break;
      }
      break;
    case "/":
    case "%":
    case "^":
      switch(op1.tipo + op2.tipo)
      {
        case 2://numero /(%)(^) numero
        case 8://numero /(%)(^) bool
          var codigo = t + " = " + op1.temp + " " + operador + " " + op2.temp + ";";
          agregar3d(codigo);
          res.temp = t;
          res.tipo = 1;
          break;
        case 14://bool /(%)(^) bool
        case 4://numero /(%)(^) cadena
        case 6://cadena /(%)(^) cadena
        case 10://cadena /(%)(^) bool
        default:
          //error estos valores no se pueden operar
          var er = {
            tipo: "Error Semantico",
            descripcion: "No se pudo operar [" + getTipo(op1.tipo) + "] " + operador + " [" + op2.tipo + "]"
          };
          agregarError(er);
          break;
      }
      break;
  }
  return res;
}

function ejecutarRelacional(op1, op2, operador) {
  var res = {temp : "tx", tipo : -1, lv: [], lf: [] };
  switch(operador)
  {
    case "==":
      switch(op1.tipo + op2.tipo)
      {
        case 2://numero == numero
        case 14://bool == bool
          var lv = getEtq();
          var lf = getEtq();
          var codigo =
            "if (" + op1.temp + " " + operador + " " + op2.temp + ") goto " + lv + ";\n"
            + "goto " + lf + ";";
          agregar3d(codigo);
          res.tipo = 7;
          res.lv.push(lv);
          res.lf.push(lf);
          break;
        case 6://cadena == cadena
          break;
        case 8://numero == bool
        case 4://numero == cadena
        case 10://cadena == bool
        default:
          //error estos valores no se pueden operar
          var er = {
            tipo: "Error Semantico",
            descripcion: "No se pudo operar [" + getTipo(op1.tipo) + "] " + operador + " [" + op2.tipo + "]"
          };
          agregarError(er);
          break;
      }
      break;
    case "!=":
      switch(op1.tipo + op2.tipo)
      {
        case 2://numero != numero
        case 14://bool != bool
          var lv = getEtq();
          var lf = getEtq();
          var codigo =
            "if (" + op1.temp + " " + operador + " " + op2.temp + ") goto " + lv + ";\n"
            + "goto " + lf + ";";
          agregar3d(codigo);
          res.tipo = 7;
          res.lv.push(lv);
          res.lf.push(lf);
          break;
        case 6://cadena != cadena
          break;
        case 8://numero != bool
        case 4://numero != cadena
        case 10://cadena != bool
        default:
          //error estos valores no se pueden operar
          var er = {
            tipo: "Error Semantico",
            descripcion: "No se pudo operar [" + getTipo(op1.tipo) + "] " + operador + " [" + op2.tipo + "]"
          };
          agregarError(er);
          break;
      }
      break;
    case ">":
      switch(op1.tipo + op2.tipo)
      {
        case 2://numero > numero
          var lv = getEtq();
          var lf = getEtq();
          var codigo =
            "if (" + op1.temp + " " + operador + " " + op2.temp + ") goto " + lv + ";\n"
            + "goto " + lf + ";";
          agregar3d(codigo);
          res.tipo = 7;
          res.lv.push(lv);
          res.lf.push(lf);
          break;
        case 6://cadena > cadena
          break;
        case 8://numero > bool
        case 4://numero > cadena
        case 10://cadena > bool
        case 14://bool > bool
        default:
          //error estos valores no se pueden operar
          var er = {
            tipo: "Error Semantico",
            descripcion: "No se pudo operar [" + getTipo(op1.tipo) + "] " + operador + " [" + op2.tipo + "]"
          };
          agregarError(er);
          break;
      }
      break;
    case "<":
      switch(op1.tipo + op2.tipo)
      {
        case 2://numero < numero
          var lv = getEtq();
          var lf = getEtq();
          var codigo =
            "if (" + op1.temp + " " + operador + " " + op2.temp + ") goto " + lv + ";\n"
            + "goto " + lf + ";";
          agregar3d(codigo);
          res.tipo = 7;
          res.lv.push(lv);
          res.lf.push(lf);
          break;
        case 6://cadena < cadena
          break;
        case 8://numero < bool
        case 4://numero < cadena
        case 10://cadena < bool
        case 14://bool < bool
        default:
          //error estos valores no se pueden operar
          var er = {
            tipo: "Error Semantico",
            descripcion: "No se pudo operar [" + getTipo(op1.tipo) + "] " + operador + " [" + op2.tipo + "]"
          };
          agregarError(er);
          res.temp = "tx";
          res.tipo = -1;
          break;
      }
      break;
    case ">=":
    case "<=":
      switch(op1.tipo + op2.tipo)
      {
        case 2://numero >= (<=) numero
          var lv = getEtq();
          var lf = getEtq();
          var codigo =
            "if (" + op1.temp + " " + operador + " " + op2.temp + ") goto " + lv + ";\n"
            + "goto " + lf + ";";
          agregar3d(codigo);
          res.tipo = 7;
          res.lv.push(lv);
          res.lf.push(lf);
          break;
        case 6://cadena >= (<=) cadena
        case 8://numero >= (<=) bool
        case 4://numero >= (<=) cadena
        case 10://cadena >= (<=) bool
        case 14://bool >= (<=) bool
        default:
          //error estos valores no se pueden operar
          var er = {
            tipo: "Error Semantico",
            descripcion: "No se pudo operar [" + getTipo(op1.tipo) + "] " + operador + " [" + op2.tipo + "]"
          };
          agregarError(er);
          res.temp = "tx";
          res.tipo = -1;
          break;
      }
      break;
  }
  return res;
}

function ejecutarLogica(valor) {
  var operador = valor.nombre;
  var res = {temp : "tx", tipo : -1, lv: [], lf: [] };
  var op1 = evaluarValor(valor.hijos[0]);
  if(valor.hijos[0].nombre == "bool")
    op1 = codigoBoolean(valor.hijos[0]);
  switch(operador)
  {
    case "&&":
    case "&?":
      if(op1.tipo == 7)
        agregar3d(op1.lv.join() + ":");
      var op2 = evaluarValor(valor.hijos[1]);
      if(valor.hijos[1].nombre == "bool")
        op2 = codigoBoolean(valor.hijos[1]);
      if(op2.tipo == 7)
      {
        res.tipo = 7;
        res.lv = res.lv.concat(op2.lv);
        res.lf = res.lf.concat(op1.lf);
        res.lf = res.lf.concat(op2.lf);
        if(operador === "&?")
        {
          var lv = res.lv;
          res.lv = res.lf;
          res.lf = lv;
        }
      }
      else
      {//error estos valores no se pueden operar
        var er = {
          tipo: "Error Semantico",
          descripcion: "No se pudo operar [" + getTipo(op1.tipo) + "] " + operador + " [" + op2.tipo + "]"
        };
        agregarError(er);
      }
      break;
    case "||":
    case "|?":
      if(op1.tipo == 7)
        agregar3d(op1.lf.join() + ":");
      var op2 = evaluarValor(valor.hijos[1]);
      if(valor.hijos[1].nombre == "bool")
        op2 = codigoBoolean(valor.hijos[1]);
      if(op2.tipo == 7)
      {
        res.tipo = 7;
        res.lv = res.lv.concat(op1.lv);
        res.lv = res.lv.concat(op2.lv);
        res.lf = res.lf.concat(op2.lf);
        if(operador === "|?")
        {
          var lv = res.lv;
          res.lv = res.lf;
          res.lf = lv;
        }
      }
      else
      {//error estos valores no se pueden operar
        var er = {
          tipo: "Error Semantico",
          descripcion: "No se pudo operar [" + getTipo(op1.tipo) + "] " + operador + " [" + op2.tipo + "]"
        };
        agregarError(er);
      }
      break;
    case "!":
      res.lv = op1.lf;
      res.lf = op1.lv;
      res.tipo = 7;
      break;
    case "|&":
      var txor = getTemp()
      if(op1.tipo == 7)
      {
        var lcond = getEtq();
        agregar3d(op1.lv.join() + ":");
        agregar3d(txor + " = 1;");
        agregar3d("goto " + lcond + ";");
        agregar3d(op1.lf.join() + ":");
        agregar3d(txor + " = 0;");
        agregar3d(lcond + ":");
      }
      var op2 = evaluarValor(valor.hijos[1]);
      if(valor.hijos[1].nombre == "bool")
        op2 = codigoBoolean(valor.hijos[1]);
      if(op2.tipo == 7)
      {
        var lv = getEtq();
        var lf = getEtq();
        agregar3d(op2.lv + ":");
        agregar3d("if (" + txor + " == 1) goto " + lv + ";");
        agregar3d("goto " + lf + ";");
        agregar3d(op2.lf + ":");
        agregar3d("if (" + txor + " == 0) goto " + lv + ";");
        agregar3d("goto " + lf + ";");
        res.tipo = 7;
        res.lv.push(lv);
        res.lf.push(lf);
      }
      else
      {//error estos valores no se pueden operar
        var er = {
          tipo: "Error Semantico",
          descripcion: "No se pudo operar [" + getTipo(op1.tipo) + "] " + operador + " [" + op2.tipo + "]"
        };
        agregarError(er);
      }
      break;
  }
  return res;
}

function codigoBoolean(valor) {
  var lv = getEtq();
  var lf = getEtq();
  var codigo = "";
  if (valor.valor == "true")
    codigo = "if ( 1 == 1 ) goto " + lv +"; \ngoto " + lf + ";";
  else
    codigo = "if ( 1 == 0 ) goto " + lv +"; \ngoto " + lf + ";";
  agregar3d(codigo);
  return { temp: "tx", tipo : 7, lv : [lv], lf : [lf] };
}

function getTipo(tipo) {
  switch(tipo)
  {
    case 1: return "num";
    case 3: return "str";
    case 7: return "bool";
  }
  switch(tipo)
  {
    case "num": return 1;
    case "str": return 3;
    case "bool": return 7;
  }
  return tipo;
}