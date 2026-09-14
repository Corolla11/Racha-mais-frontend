import { useState } from "react";
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Mail,
  Star,
  User,
} from "lucide-react";

export default function Cadastro() {
  // Controla se a senha está visível
  const [mostrarSenha, setMostrarSenha] = useState(false);

  // Controla se a confirmação da senha está visível
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);

  // Dados do formulário
  const [formulario, setFormulario] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    termos: false,
  });

  // Altera os dados do formulário
  function handleChange(
    campo: keyof typeof formulario,
    valor: string | boolean
  ) {
    setFormulario((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  }

  // Envia o formulário
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    console.log("Dados do cadastro:", formulario);
  }

  return (
    <main className="min-h-screen bg-background font-jakarta">

      {/* =====================================================
          CONTAINER PRINCIPAL
      ====================================================== */}

      <div
        className="
          mx-auto
          flex
          min-h-screen
          max-w-[1440px]
          overflow-hidden
          bg-surface
          shadow-sm
          md:min-h-[calc(100vh-48px)]
          md:rounded-2xl
        "
      >

        {/* =====================================================
            LADO ESQUERDO
        ====================================================== */}

        <section
          className="
            relative
            hidden
            w-[40%]
            flex-col
            justify-between
            overflow-hidden
            bg-[#EAF3FF]
            p-8
            lg:flex
            xl:p-10
          "
        >

          {/* Decoração superior */}

          <div
            className="
              absolute
              -right-20
              -top-20
              h-64
              w-64
              rounded-full
              bg-white/40
            "
          />

          {/* Decoração inferior */}

          <div
            className="
              absolute
              -bottom-32
              -left-20
              h-80
              w-80
              rounded-full
              bg-white/30
            "
          />

          {/* Conteúdo */}

          <div className="relative z-10">

            {/* Badge */}

            <div
              className="
                mb-7
                inline-flex
                items-center
                gap-2
                rounded-full
                bg-[#DCEBFA]
                px-3
                py-1.5
                text-xs
                font-semibold
                text-secondary
              "
            >
              <span className="h-2 w-2 rounded-full bg-primary" />

              Cadastro sem burocracia
            </div>


            {/* Título */}

            <h1
              className="
                max-w-[440px]
                text-4xl
                font-bold
                leading-[1.18]
                tracking-[-0.03em]
                text-text-primary
                xl:text-[40px]
              "
            >
              Comece a organizar grupos sem dor de cabeça em{" "}

              <span
                className="
                  text-tertiary
                  underline
                  decoration-[2px]
                  underline-offset-4
                "
              >
                menos de 2 minutos.
              </span>
            </h1>


            {/* Descrição */}

            <p
              className="
                mt-5
                max-w-[470px]
                text-sm
                leading-6
                text-text-secondary
              "
            >
              Centralize rateios justos, compras coletivas, rotinas de limpeza
              e convivência harmoniosa em um único painel transparente e
              descomplicado.
            </p>


            {/* =================================================
                BENEFÍCIOS
            ================================================== */}

            {/* Benefício 1 */}

            <div className="mt-7 flex items-center gap-3">

              <div
                className="
                  flex
                  h-4
                  w-4
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-tertiary
                "
              >
                <Check
                  size={11}
                  strokeWidth={3}
                  className="text-white"
                />
              </div>

              <span className="text-xs font-medium text-text-secondary">
                Divisão proporcional automática de contas e boletos
              </span>

            </div>


            {/* Benefício 2 */}

            <div className="mt-4 flex items-center gap-3">

              <div
                className="
                  flex
                  h-4
                  w-4
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-tertiary
                "
              >
                <Check
                  size={11}
                  strokeWidth={3}
                  className="text-white"
                />
              </div>

              <span className="text-xs font-medium text-text-secondary">
                Notificações amigáveis e transparentes no WhatsApp
              </span>

            </div>


            {/* Benefício 3 */}

            <div className="mt-4 flex items-center gap-3">

              <div
                className="
                  flex
                  h-4
                  w-4
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-tertiary
                "
              >
                <Check
                  size={11}
                  strokeWidth={3}
                  className="text-white"
                />
              </div>

              <span className="text-xs font-medium text-text-secondary">
                Histórico completo sem cobranças desconfortáveis
              </span>

            </div>

          </div>


          {/* =====================================================
              DEPOIMENTO
          ====================================================== */}

          <div
            className="
              relative
              z-10
              mt-10
              rounded-xl
              bg-surface
              p-5
              shadow-sm
            "
          >

            {/* Estrelas */}

            <div className="mb-3 flex items-center gap-1 text-primary">

              <Star size={15} fill="currentColor" />
              <Star size={15} fill="currentColor" />
              <Star size={15} fill="currentColor" />
              <Star size={15} fill="currentColor" />
              <Star size={15} fill="currentColor" />

              <span className="ml-1 text-xs font-bold text-text-secondary">
                5.0
              </span>

            </div>


            {/* Depoimento */}

            <p
              className="
                text-sm
                italic
                leading-5
                text-text-secondary
              "
            >
              “Mudou a convivência na nossa república. Ninguém mais fica
              cobrando ninguém no WhatsApp.”
            </p>


            {/* Autor */}

            <div className="mt-4 flex items-center gap-3">

              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  bg-[#DDEAF7]
                  text-sm
                  font-bold
                  text-secondary
                "
              >
                BM
              </div>

              <div>

                <p className="text-xs font-bold text-text-primary">
                  Beatriz Mendonça
                </p>

                <p className="text-[11px] text-text-secondary">
                  Moradora em república • São Carlos, SP
                </p>

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            LADO DIREITO
        ====================================================== */}

        <section
          className="
            flex
            w-full
            flex-col
            justify-between
            bg-surface
            p-6
            sm:p-8
            lg:w-[60%]
            lg:p-10
            xl:p-12
          "
        >

          <div>

            {/* =================================================
                CABEÇALHO
            ================================================== */}

            <div className="mb-7 flex items-center justify-between">

              <span
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-wide
                  text-secondary
                "
              >
                RACHA+ PRIMEIROS PASSOS
              </span>

              <span
                className="
                  text-[10px]
                  font-medium
                  text-text-secondary
                "
              >
                Passo 1 de 2
              </span>

            </div>


            {/* Título */}

            <div className="mb-5">

              <h2
                className="
                  text-3xl
                  font-bold
                  tracking-[-0.03em]
                  text-text-primary
                "
              >
                Criar sua conta
              </h2>

              <p
                className="
                  mt-1
                  text-sm
                  text-text-secondary
                "
              >
                Junte-se a milhares de repúblicas, casais e viagens organizadas
                no Racha+.
              </p>

            </div>


            {/* =================================================
                BOTÃO GOOGLE
            ================================================== */}

            <button
              type="button"
              className="
                flex
                h-11
                w-full
                items-center
                justify-center
                gap-3
                rounded-xl
                bg-input
                text-sm
                font-semibold
                text-text-primary
                transition
                duration-200
                hover:bg-neutral/10
              "
            >

              <span className="text-lg font-bold text-[#4285F4]">
                G
              </span>

              Continuar com Google

            </button>


            {/* =================================================
                DIVISOR
            ================================================== */}

            <div className="my-5 flex items-center gap-3">

              <div className="h-px flex-1 bg-neutral/30" />

              <span
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  text-secondary
                "
              >
                ou com seu e-mail
              </span>

              <div className="h-px flex-1 bg-neutral/30" />

            </div>


            {/* =================================================
                FORMULÁRIO
            ================================================== */}

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >

              {/* =================================================
                  NOME
              ================================================== */}

              <div>

                <label
                  htmlFor="nome"
                  className="
                    mb-2
                    block
                    text-xs
                    font-semibold
                    text-text-primary
                  "
                >
                  Nome completo
                </label>

                <div className="relative">

                  <input
                    id="nome"
                    type="text"
                    placeholder="Mariana Silva"
                    value={formulario.nome}
                    onChange={(event) =>
                      handleChange("nome", event.target.value)
                    }
                    className="
                      h-11
                      w-full
                      rounded-xl
                      border
                      border-transparent
                      bg-input
                      px-4
                      pr-11
                      text-sm
                      text-text-primary
                      outline-none
                      transition
                      duration-200
                      placeholder:text-neutral
                      focus:border-primary
                      focus:bg-surface
                    "
                  />

                  <User
                    size={17}
                    className="
                      absolute
                      right-4
                      top-1/2
                      -translate-y-1/2
                      text-neutral
                    "
                  />

                </div>

              </div>


              {/* =================================================
                  EMAIL
              ================================================== */}

              <div>

                <label
                  htmlFor="email"
                  className="
                    mb-2
                    block
                    text-xs
                    font-semibold
                    text-text-primary
                  "
                >
                  E-mail pessoal ou acadêmico
                </label>

                <div className="relative">

                  <input
                    id="email"
                    type="email"
                    placeholder="mariana.silva@exemplo.com"
                    value={formulario.email}
                    onChange={(event) =>
                      handleChange("email", event.target.value)
                    }
                    className="
                      h-11
                      w-full
                      rounded-xl
                      border
                      border-transparent
                      bg-input
                      px-4
                      pr-11
                      text-sm
                      text-text-primary
                      outline-none
                      transition
                      duration-200
                      placeholder:text-neutral
                      focus:border-primary
                      focus:bg-surface
                    "
                  />

                  <Mail
                    size={17}
                    className="
                      absolute
                      right-4
                      top-1/2
                      -translate-y-1/2
                      text-neutral
                    "
                  />

                </div>

              </div>


              {/* =================================================
                  SENHAS
              ================================================== */}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                {/* SENHA */}

                <div>

                  <div className="mb-2 flex items-center justify-between">

                    <label
                      htmlFor="senha"
                      className="
                        text-xs
                        font-semibold
                        text-text-primary
                      "
                    >
                      Criar senha
                    </label>

                    <span
                      className="
                        text-[10px]
                        font-semibold
                        text-tertiary
                      "
                    >
                      • Forte
                    </span>

                  </div>

                  <div className="relative">

                    <input
                      id="senha"
                      type={mostrarSenha ? "text" : "password"}
                      value={formulario.senha}
                      onChange={(event) =>
                        handleChange("senha", event.target.value)
                      }
                      className="
                        h-11
                        w-full
                        rounded-xl
                        border
                        border-transparent
                        bg-input
                        px-4
                        pr-11
                        text-sm
                        text-text-primary
                        outline-none
                        transition
                        duration-200
                        focus:border-primary
                        focus:bg-surface
                      "
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setMostrarSenha(!mostrarSenha)
                      }
                      className="
                        absolute
                        right-3
                        top-1/2
                        -translate-y-1/2
                        text-neutral
                        transition
                        hover:text-secondary
                      "
                      aria-label={
                        mostrarSenha
                          ? "Ocultar senha"
                          : "Mostrar senha"
                      }
                    >
                      {mostrarSenha ? (
                        <EyeOff size={17} />
                      ) : (
                        <Eye size={17} />
                      )}
                    </button>

                  </div>


                  {/* Barra de força */}

                  <div className="mt-2 flex h-[3px] gap-1">

                    <span className="flex-1 rounded-full bg-primary" />

                    <span className="flex-1 rounded-full bg-primary" />

                    <span className="flex-1 rounded-full bg-tertiary" />

                  </div>

                </div>


                {/* CONFIRMAR SENHA */}

                <div>

                  <div className="mb-2 flex items-center justify-between">

                    <label
                      htmlFor="confirmarSenha"
                      className="
                        text-xs
                        font-semibold
                        text-text-primary
                      "
                    >
                      Confirmar senha
                    </label>

                    <span
                      className="
                        text-[10px]
                        font-semibold
                        text-secondary
                      "
                    >
                      Correspondente
                    </span>

                  </div>

                  <div className="relative">

                    <input
                      id="confirmarSenha"
                      type={
                        mostrarConfirmacao
                          ? "text"
                          : "password"
                      }
                      value={formulario.confirmarSenha}
                      onChange={(event) =>
                        handleChange(
                          "confirmarSenha",
                          event.target.value
                        )
                      }
                      className="
                        h-11
                        w-full
                        rounded-xl
                        border
                        border-transparent
                        bg-input
                        px-4
                        pr-11
                        text-sm
                        text-text-primary
                        outline-none
                        transition
                        duration-200
                        focus:border-primary
                        focus:bg-surface
                      "
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setMostrarConfirmacao(
                          !mostrarConfirmacao
                        )
                      }
                      className="
                        absolute
                        right-3
                        top-1/2
                        -translate-y-1/2
                        text-neutral
                        transition
                        hover:text-secondary
                      "
                      aria-label={
                        mostrarConfirmacao
                          ? "Ocultar confirmação"
                          : "Mostrar confirmação"
                      }
                    >
                      {mostrarConfirmacao ? (
                        <EyeOff size={17} />
                      ) : (
                        <Eye size={17} />
                      )}
                    </button>

                  </div>


                  {/* Barra */}

                  <div className="mt-2 h-[3px] rounded-full bg-primary" />

                </div>

              </div>


              {/* =================================================
                  TERMOS
              ================================================== */}

              <label
                htmlFor="termos"
                className="
                  flex
                  cursor-pointer
                  items-start
                  gap-3
                  py-1
                "
              >

                <input
                  id="termos"
                  type="checkbox"
                  checked={formulario.termos}
                  onChange={(event) =>
                    handleChange(
                      "termos",
                      event.target.checked
                    )
                  }
                  className="sr-only"
                />

                {/* Checkbox visual */}

                <span
                  className={`
                    mt-[1px]
                    flex
                    h-4
                    w-4
                    shrink-0
                    items-center
                    justify-center
                    rounded-[3px]
                    border
                    transition
                    duration-150
                    ${
                      formulario.termos
                        ? "border-tertiary bg-tertiary"
                        : "border-neutral bg-surface"
                    }
                  `}
                >

                  {formulario.termos && (
                    <Check
                      size={12}
                      strokeWidth={3}
                      className="text-white"
                    />
                  )}

                </span>


                <span
                  className="
                    text-xs
                    leading-5
                    text-text-secondary
                  "
                >
                  Concordo com os{" "}

                  <a
                    href="#"
                    className="
                      font-medium
                      text-secondary
                      hover:underline
                    "
                  >
                    Termos de Uso
                  </a>{" "}

                  e a{" "}

                  <a
                    href="#"
                    className="
                      font-medium
                      text-secondary
                      hover:underline
                    "
                  >
                    Política de Privacidade
                  </a>{" "}

                  do Racha+.

                </span>

              </label>


              {/* =================================================
                  BOTÃO CRIAR CONTA
              ================================================== */}

              <button
                type="submit"
                className="
                  group
                  flex
                  h-12
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-primary
                  text-sm
                  font-bold
                  text-text-primary
                  shadow-sm
                  transition
                  duration-200
                  hover:bg-tertiary
                  active:scale-[0.99]
                "
              >

                Criar minha conta

                <ArrowRight
                  size={18}
                  className="
                    transition-transform
                    duration-200
                    group-hover:translate-x-1
                  "
                />

              </button>

            </form>

          </div>


          {/* =====================================================
              RODAPÉ
          ====================================================== */}

          <div className="mt-8 text-center">

            <p className="text-xs text-text-secondary">

              Já tem uma conta?{" "}

              <a
                href="#"
                className="
                  font-semibold
                  text-tertiary
                  hover:underline
                "
              >
                Entrar agora
              </a>

            </p>

          </div>

        </section>

      </div>

    </main>
  );
}