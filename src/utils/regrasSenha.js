

const regras = [
  {
    teste: s => s.length >= 8,
    mensagem: 'Senha deve ter no mínimo 8 caracteres.'
  },
  {
    teste: s => /[A-Z]/.test(s),
    mensagem: 'Senha deve ter ao menos uma letra maiúscula.'
  },
  {
    teste: s => /[a-z]/.test(s),
    mensagem: 'Senha deve ter ao menos uma letra minúscula.'
  },
  {
    teste: s => /[0-9]/.test(s),
    mensagem: 'Senha deve ter ao menos um número.'
  },
  {
    teste: s => /[^A-Za-z0-9]/.test(s),
    mensagem: 'Senha deve ter ao menos um caractere especial (ex: @, !, #).'
  },
];
 
/**
 * Valida a senha contra todas as regras.
 * Retorna o primeiro erro encontrado, ou null se estiver tudo certo.
 *
 * Exemplo:
 *   validarSenha("abc")  → "Senha deve ter no mínimo 8 caracteres."
 *   validarSenha("Abc@1234") → null  (válida)
 */
function validarSenha(senha) {
  for (const regra of regras) {
    if (!regra.teste(senha)) {
      return regra.mensagem; // retorna o PRIMEIRO erro
    }
  }
  return null; // sem erros = senha válida
}
 
module.exports = { validarSenha, regras };