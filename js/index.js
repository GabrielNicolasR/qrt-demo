const subcategorias = {
    'erro-cotas': [
        'Cotas não aparecem no sistema',
        'Valor de cotas incorreto',
        'Cotas duplicadas',
        'Erro no cálculo de cotas',
        'Outro'
    ],
    'erro-boletar': [
        'Boleta não gerada',
        'Dados incorretos na boleta',
        'Erro ao enviar boleta',
        'Boleta duplicada',
        'Outro'
    ],
    'gestor-sem-permissao': [
        'Não consegue acessar fundo',
        'Permissão de visualização negada',
        'Erro ao editar dados',
        'Permissões não atualizadas',
        'Outro'
    ],
    'erro-integracao': [
        'Integração não funciona',
        'Dados não sincronizam',
        'Timeout na integração',
        'Erro de autenticação',
        'Outro'
    ],
    'erro-participantes': [
        'Participante não cadastrado',
        'Dados do participante incorretos',
        'Erro ao adicionar participante',
        'Participante duplicado',
        'Outro'
    ],
    'validacao-procuracoes': [
        'Procuração não reconhecida',
        'Documento inválido',
        'Prazo de procuração vencido',
        'Dados inconsistentes',
        'Outro'
    ],
    'extrato-financeiro': [
        'Extrato não gerado',
        'Valores incorretos no extrato',
        'Extrato incompleto',
        'Erro ao exportar extrato',
        'Outro'
    ]
};

const qrtMapping = {
    'erro-cotas': { qrt: 'QRT-Fundos', prob: 95 },
    'erro-boletar': { qrt: 'QRT-Fundos', prob: 95 },
    'erro-integracao': { qrt: 'QRT-Fundos', prob: 90 },
    'gestor-sem-permissao': { qrt: 'QRT-Permissionamento', prob: 75 },
    'erro-participantes': { qrt: 'QRT-Investidor', prob: 92 },
    'validacao-procuracoes': { qrt: 'QRT-Investidor', prob: 95 },
    'extrato-financeiro': { qrt: 'QRT-Banking', prob: 98 }
};

// Máscara de CNPJ
document.getElementById('cnpj').addEventListener('input', function (e) {
    let value = e.target.value.replace(/\D/g, '');

    if (value.length <= 14) {
        value = value.replace(/^(\d{2})(\d)/, '$1.$2');
        value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
        value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
        value = value.replace(/(\d{4})(\d)/, '$1-$2');
    }

    e.target.value = value;
});

document.getElementById('categoria').addEventListener('change', function () {
    const subcatContainer = document.getElementById('subcategoria-container');
    const subcatCheckboxes = document.getElementById('subcategoria-checkboxes');
    const resultado = document.getElementById('resultado');

    resultado.classList.add('hidden');

    if (this.value) {
        subcatCheckboxes.innerHTML = '';

        subcategorias[this.value].forEach((sub, index) => {
            setTimeout(() => {
                const checkboxItem = document.createElement('div');
                checkboxItem.className = 'checkbox-item';
                checkboxItem.style.animationDelay = `${index * 0.1}s`;

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = `sub-${index}`;
                checkbox.value = sub.toLowerCase().replace(/\s+/g, '-');
                checkbox.addEventListener('change', function () {
                    if (this.checked) {
                        checkboxItem.classList.add('checked');
                    } else {
                        checkboxItem.classList.remove('checked');
                    }
                });

                const label = document.createElement('label');
                label.htmlFor = `sub-${index}`;
                label.textContent = sub;

                checkboxItem.appendChild(checkbox);
                checkboxItem.appendChild(label);

                checkboxItem.addEventListener('click', function (e) {
                    if (e.target !== checkbox) {
                        checkbox.click();
                    }
                });

                subcatCheckboxes.appendChild(checkboxItem);
            }, index * 100);
        });

        subcatContainer.classList.remove('hidden');
    } else {
        subcatContainer.classList.add('hidden');
        subcatCheckboxes.innerHTML = '';
    }
});

function analisarSolicitacao() {
    const nome = document.getElementById('nome').value.trim();
    const resumo = document.getElementById('resumo').value.trim();
    const classificacaoRadio = document.querySelector('input[name="classificacao"]:checked');
    const categoria = document.getElementById('categoria').value;
    const resultado = document.getElementById('resultado');

    if (!nome || !resumo || !classificacaoRadio || !categoria) {
        alert('Por favor, preencha todos os campos obrigatórios (Nome, Resumo, Classificação e Categoria).');
        return;
    }

    const classificacao = classificacaoRadio.value;

    const checkboxes = document.querySelectorAll('#subcategoria-checkboxes input[type="checkbox"]:checked');

    if (checkboxes.length === 0) {
        alert('Por favor, selecione pelo menos uma subcategoria.');
        return;
    }

    const mapping = qrtMapping[categoria];

    if (!mapping) {
        resultado.innerHTML = `
                    <div class="warning-panel">
                        <h4>⚠️ Categoria não mapeada</h4>
                        <p>Esta solicitação precisará ser <strong>triada manualmente</strong> pela equipe de suporte.</p>
                        <p style="margin-top: 10px;">O sistema ainda não possui mapeamento inteligente para esta categoria.</p>
                    </div>
                `;
        resultado.classList.remove('hidden');
        return;
    }

    const selectedSubcats = Array.from(checkboxes).map(cb =>
        cb.parentElement.querySelector('label').textContent
    ).join(', ');

    const classificacaoLabels = {
        'incidente': 'Incidente',
        'falha-sistemica': 'Falha Sistêmica',
        'requisicao': 'Requisição de Serviço',
        'solicitacao': 'Solicitação de Análise',
        'duvida': 'Dúvidas'
    };
    const classificacaoText = classificacaoLabels[classificacao];

    setTimeout(() => {
        resultado.innerHTML = `
                    <div class="result-panel">
                        <div class="result-header">
                            🎯 Análise Concluída
                        </div>
                        <div class="probability-text">${mapping.prob}%</div>
                        <div class="probability-bar">
                            <div class="probability-fill" style="width: ${mapping.prob}%"></div>
                        </div>
                        <div style="font-size: 14px; opacity: 0.95; margin-bottom: 16px;">
                            Probabilidade de direcionamento correto
                        </div>
                        <div class="result-details">
                            <div class="result-label">QRT Recomendado:</div>
                            <div class="result-value">${mapping.qrt}</div>
                        </div>
                        <div class="result-details" style="margin-top: 12px;">
                            <div class="result-label">Solicitante:</div>
                            <div class="result-value">${nome}</div>
                        </div>
                        <div class="result-details" style="margin-top: 12px;">
                            <div class="result-label">Classificação:</div>
                            <div class="result-value">${classificacaoText}</div>
                        </div>
                        <div class="result-details" style="margin-top: 12px;">
                            <div class="result-label">Categoria:</div>
                            <div class="result-value">${document.getElementById('categoria').options[document.getElementById('categoria').selectedIndex].text}</div>
                        </div>
                        <div class="result-details" style="margin-top: 12px;">
                            <div class="result-label">Subcategorias Selecionadas:</div>
                            <div class="result-value" style="font-size: 14px;">${selectedSubcats}</div>
                        </div>
                        <div style="margin-top: 16px; font-size: 13px; opacity: 0.9;">
                            ✅ Este chamado será automaticamente direcionado para a equipe correta, reduzindo o tempo de triagem e análise.
                        </div>
                    </div>
                `;
        resultado.classList.remove('hidden');
        resultado.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 300);
}