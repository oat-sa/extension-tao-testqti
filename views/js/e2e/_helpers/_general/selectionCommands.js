/**
 * Selects the text content of passed element
 * @see https://github.com/cypress-io/cypress/issues/2839#issuecomment-447012818
 */
Cypress.Commands.add('selectText', { prevSubject: true }, (subject) => {
    cy.wrap(subject)
        .trigger('mousedown')
        .then(($el) => {
            const el = $el[0];
            const document = el.ownerDocument;
            const range = document.createRange();
            range.selectNodeContents(el);
            document.getSelection().removeAllRanges(range);
            document.getSelection().addRange(range);
        })
        .trigger('mouseup');

    cy.document().trigger('selectionchange');
    return cy.wrap(subject);
});
