/*
  Exercício 07 (Exercícios-38)
  
  - No index.html, comente a div com a classe "container" que contém a tabela;
  - Descomente: 
    - A <div> com a classe "container" abaixo da div que você acabou de 
      comentar;
    - A <link> que importa o style.css;
  - Construa uma aplicação de conversão de conversão de moedas. O HTML e CSS 
    são os que você está vendo no browser (após salvar os arquivos);
  - Você poderá modificar a marcação e estilos da aplicação depois. No momento, 
    concentre-se em executar o que descreverei abaixo;
    - Quando a página for carregada: 
      - Popule os <select> com tags <option> que contém as moedas que podem ser
        convertidas. "BRL" para real brasileiro, "EUR" para euro, "USD" para 
        dollar dos Estados Unidos, etc.
      - O option selecionado por padrão no 1º <select> deve ser "USD" e o option
        no 2º <select> deve ser "BRL";
      - O parágrafo com data-js="converted-value" deve exibir o resultado da 
        conversão de 1 USD para 1 BRL;
      - Quando um novo número for inserido no input com 
        data-js="currency-one-times", o parágrafo do item acima deve atualizar 
        seu valor;
      - O parágrafo com data-js="conversion-precision" deve conter a conversão 
        apenas x1. Exemplo: 1 USD = 5.0615 BRL;
      - O conteúdo do parágrafo do item acima deve ser atualizado à cada 
        mudança nos selects;
      - O conteúdo do parágrafo data-js="converted-value" deve ser atualizado à
        cada mudança nos selects e/ou no input com data-js="currency-one-times";
      - Para que o valor contido no parágrafo do item acima não tenha mais de 
        dois dígitos após o ponto, você pode usar o método toFixed: 
        https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toFixed
    - Para obter as moedas com os valores já convertidos, use a Exchange rate 
      API: https://www.exchangerate-api.com/;
      - Para obter a key e fazer requests, você terá que fazer login e escolher
        o plano free. Seus dados de cartão de crédito não serão solicitados.
*/

/*
ExchangeRate-API - https://app.exchangerate-api.com/dashboard
Your API Key: f175589178401b16e154dcc7
Example Request: https://v6.exchangerate-api.com/v6/f175589178401b16e154dcc7/latest/USD
*/

const currencyFrom = document.querySelector('[data-js="currency-one"]')
const currencyTo = document.querySelector('[data-js="currency-two"]')
const quant = document.querySelector('[data-js="currency-one-times"]')
const convertedValue = document.querySelector('[data-js="converted-value"]')
const pCotacao = document.querySelector('[data-js="conversion-precision"]')
const currenciesEl = document.querySelector('[data-js="currencies-container"]')

const APIkey = 'f175589178401b16e154dcc7'

const getUrl = moeda => `https://v6.exchangerate-api.com/v6/${APIkey}/latest/${moeda}`
let conversionRates = []

const getListaMoedas = (selected = '') => {
  const lista  = Object.keys(conversionRates)
    .reduce((acc, item) => (
      item === selected 
        ? `${ acc }<option value="${ item }" selected>${ item }</option>\n`
        : `${ acc }<option value="${ item }">${ item }</option>\n`
  ), '')

  return lista
}

const getErrorMessage = errorType => ({
  'unsupported-code': 'A moeda não existe em nosso banco de dados.',
  'base-code-only-on-pro': 'Informações de moedas que não sejam USD ou EUR só no plano Pro',
  'malformed-request': 'O endpoint do seu request não está correto.',
  'invalid-key': 'A chave da API não é válida ou sua conta está inativa.',
  'quota-reached': 'Sua conta alcançou o limite de requisições permitido em seu plano atual.',
  'not-available-on-plan': 'Seu plano atual não permite esse tipo de request.'
})[errorType] || 'Não foi possível obter a cotação'

const showErrorMessage = (message) => {
  const div = document.createElement('div')
  const button = document.createElement('button')

  div.classList.add('alert', 'alert-warning', 'alert-dismissible', 'fade', 'show')
  div.setAttribute('role', 'alert')
  button.classList.add('btn-close')
  button.setAttribute('type', 'button')
  button.setAttribute('aria-label', 'Close')      
  button.addEventListener('click', () => div.remove())
  div.textContent = message
  div.appendChild(button)
  currenciesEl.insertAdjacentElement('afterend', div)  
}

const fetchCotacoes = async(moeda) => {
  try {
    const response = await fetch(getUrl(moeda))

    if (!response.ok) {
      throw new Error('Sua conexão falhou.')
    }

    const objCota = await response.json()
    conversionRates = objCota.conversion_rates

    console.log(conversionRates)

    if (objCota.result === 'error') {
      showErrorMessage(getErrorMessage(objCota['error-type']))
      return false
    }

    return true
  }
  catch (err) {
    showErrorMessage(err.message)
    return false
  }
}

const converteValor = () => {
  const moedaDe = currencyFrom.value
  const moedaPara = currencyTo.value 
  const cotacao = conversionRates[moedaPara]
  const valor = cotacao * quant.value
  
  if (moedaDe || moedaPara) {
    convertedValue.textContent = `${valor.toFixed(2)} ${moedaPara}`
    pCotacao.textContent = `1 ${moedaDe} = ${cotacao.toFixed(2)} ${moedaPara}`
  }
}

currencyFrom.addEventListener('input', (e) => {
  fetchCotacoes(e.target.value)
  .then(value => converteValor())
})

currencyTo.addEventListener('input', converteValor)

quant.addEventListener('input', converteValor)

function init() {
  fetchCotacoes('USD')
  .then(value => {
    currencyFrom.innerHTML = getListaMoedas('USD')
    currencyTo.innerHTML = getListaMoedas('BRL')
    converteValor()
  })
}

init()
