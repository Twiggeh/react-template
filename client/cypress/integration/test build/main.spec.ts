/* 
Cannot test this, due to HMR Restarting tests ?
describe('Hot Module Replacement', () => {
	before(() => {
		cy.visit('/').waitForReact(1000);
	});

	after(() => cy.visit('/'));

	const defaultValue = __counter_Test_Value_HMR;
	const testValue = 'The count is _HMR=TRUE???_ : ';
	const HMRFileToWrite = `export const __counter_Test_Value_HMR = "${testValue}";`;
	let currentCounterValue = 0;

	it('Reloads on file change, while keeping state', () => {
		cy.reload();
		cy.get('[class*="StyledCounterDisplay"]')
			.should('exist')
			.and('have.length', 1)
			.and('have.text', `${defaultValue}${currentCounterValue}`)
			.writeFile(
				join(
					__dirname,
					'../../../src/components/__counter_test_hot_module_replacement.ts'
				),
				// eslint-disable-next-line quotes
				HMRFileToWrite
			)
			.get('[class*="StyledCounterDisplay"]')
			.should('exist')
			.and('have.length', 1)
			.and('have.text', `${testValue}${currentCounterValue}`)
			.contains('[class*="CounterButton"]', '+')
			.should('exist')
			.and('have.length', 1)
			.click()
			.then(() => (currentCounterValue += 1));
	});
});
*/

describe('Emotion Transform Plugin Working Correctly', () => {
	before(() => {
		cy.visit('/').waitForReact(1000);
	});

	after(() => cy.visit('/'));

	it('Pipes Styled-Components name into the css class', () => {
		cy.get('[class*="StyledCounter "]')
			.should('exist')
			.and('have.length', 1)
			.get('[class*="StyledCounterDisplay"]')
			.should('exist')
			.and('have.length', 1)
			.get('[class*="CounterButton"]')
			.should('exist')
			.and('have.length', 2);
	});
});

describe('Emotion Transform Plugin Working Correctly', () => {
	before(() => {
		cy.visit('/').waitForReact(1000);
	});

	after(() => cy.visit('/'));

	it('Counter functionality', () => {
		cy.contains('[class*="CounterButton"]', '+')
			.should('exist')
			.click()
			.get('[class*="StyledCounterDisplay"]')
			.should('have.text', 'Current count : 1');
	});
});
