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

/**
 * Drags a DOM element by simulating mouse events
 * @param {Object} point
 * @param {Number} point.x
 * @param {Number} point.y
 * @param {String} [position] - Valid positions are topLeft, top, topRight, left, center, right, bottomLeft, bottom, and bottomRight
 * @returns {DOMElement}
 */
Cypress.Commands.add('dragToPoint', { prevSubject: true }, (subject, point, position = 'center') => {
    cy.wrap(subject)
        .trigger('mousedown', position)
        .trigger('mousemove', { pageX: point.x, pageY: point.y, clientX: point.x, clientY: point.y , view: window })
        .trigger('mouseup');

    return cy.wrap(subject);
});
