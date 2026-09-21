-- Seeder: principais instituições financeiras do Brasil
-- Tabela: banks (tax_id, name, fantasy_name, ispb, compe_code)
-- ATENÇÃO: tax_id/ispb/compe_code são dados regulatórios (Bacen/STR).
-- Confira contra a lista oficial de participantes do Bacen antes de usar em produção:
-- https://www.bcb.gov.br/estabilidadefinanceira/staticfilebalcao

INSERT INTO banks (tax_id, name, fantasy_name, ispb, compe_code)
SELECT v.tax_id, v.name, v.fantasy_name, v.ispb, v.compe_code
FROM (
    VALUES
        ('00000000000191', 'Banco do Brasil S.A.', 'Banco do Brasil', '00000000', '001'),
        ('60746948000112', 'Banco Bradesco S.A.', 'Bradesco', '60746948', '237'),
        ('60701190000104', 'Itaú Unibanco S.A.', 'Itaú', '60701190', '341'),
        ('00360305000104', 'Caixa Econômica Federal', 'Caixa', '00360305', '104'),
        ('90400888000142', 'Banco Santander (Brasil) S.A.', 'Santander', '90400888', '033'),
        ('58160789000128', 'Banco Safra S.A.', 'Safra', '58160789', '422'),
        ('30306294000145', 'Banco BTG Pactual S.A.', 'BTG Pactual', '30306294', '208'),
        ('18236120000158', 'Nu Pagamentos S.A.', 'Nubank', '18236120', '260'),
        ('00416968000101', 'Banco Inter S.A.', 'Inter', '00416968', '077'),
        ('08561701000101', 'PagSeguro Internet S.A.', 'PagBank', '08561701', '290'),
        ('31872495000172', 'Banco C6 S.A.', 'C6 Bank', '31872495', '336'),
        ('59588111000103', 'Banco Votorantim S.A.', 'Banco BV', '59588111', '655'),
        ('59285411000113', 'Banco PAN S.A.', 'Banco PAN', '59285411', '623'),
        ('92894922000108', 'Banco Original S.A.', 'Banco Original', '92894922', '212'),
        ('01181521000155', 'Banco Cooperativo Sicredi S.A.', 'Sicredi', '01181521', '748'),
        ('02038232000164', 'Banco Cooperativo do Brasil S.A.', 'Sicoob', '02038232', '756')
) AS v(tax_id, name, fantasy_name, ispb, compe_code)
WHERE NOT EXISTS (
    SELECT 1 FROM banks b WHERE b.tax_id = v.tax_id
);
