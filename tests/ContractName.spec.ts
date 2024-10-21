import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano } from '@ton/core';
import { ContractName } from '../wrappers/Counter_three';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('ContractName', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('ContractName');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let contractName: SandboxContract<ContractName>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        contractName = blockchain.openContract(
            ContractName.createFromConfig(
                {
                    id: 0,
                    counter: 0,
                },
                code
            )
        );

        deployer = await blockchain.treasury('deployer');

        const deployResult = await contractName.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: contractName.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and contractName are ready to use
    });

    it('should increase counter', async () => {
        const increaseTimes = 3;
        for (let i = 0; i < increaseTimes; i++) {
            console.log(`increase ${i + 1}/${increaseTimes}`);

            const increaser = await blockchain.treasury('increaser' + i);

            const counterBefore = await contractName.getCounter();

            console.log('counter before increasing', counterBefore);

            const increaseBy = Math.floor(Math.random() * 100);

            console.log('increasing by', increaseBy);

            const increaseResult = await contractName.sendIncrease(increaser.getSender(), {
                increaseBy,
                value: toNano('0.05'),
            });

            expect(increaseResult.transactions).toHaveTransaction({
                from: increaser.address,
                to: contractName.address,
                success: true,
            });

            const counterAfter = await contractName.getCounter();

            console.log('counter after increasing', counterAfter);

            expect(counterAfter).toBe(counterBefore + increaseBy);
        }
    });
});
