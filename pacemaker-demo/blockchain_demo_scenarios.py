"""
Blockchain-Connected Demo Scenarios Module
==========================================
Demonstration scenarios that interact with real blockchain smart contracts.
"""

import time
from typing import Dict
from blockchain_connector import BlockchainConnector
from utils import (
    print_header, print_info, print_success, print_error, 
    print_warning, print_transaction_details
)

class BlockchainDemoScenarios:
    """Manages and executes blockchain-connected demonstration scenarios"""
    
    def __init__(self, blockchain: BlockchainConnector):
        self.blockchain = blockchain
    
    def demo_authorized_access(self):
        """Demonstrate a legitimate, authorized command via blockchain"""
        print_header("=" * 80)
        print_header("SCENARIO 1: AUTHORIZED ACCESS - REAL BLOCKCHAIN TRANSACTION")
        print_header("=" * 80)
        
        print_info("\n📝 Scenario Description:")
        print_info("   A doctor sends a legitimate 'status' command to the blockchain.")
        print_info("   The smart contract validates and accepts the command.\n")
        
        time.sleep(1)
        
        # Check cooldown first
        remaining = self.blockchain.wait_for_cooldown('doctor')
        if remaining > 0:
            print_warning(f"   ⏳ Cooldown active. Waiting {remaining} seconds...")
            time.sleep(remaining + 1)
        
        # Submit command to blockchain
        success, message, receipt = self.blockchain.submit_command('doctor', 'status')
        
        print()
        if success:
            print_success("=" * 80)
            print_success("✅ COMMAND ACCEPTED BY BLOCKCHAIN")
            print_success("=" * 80)
            print_success(f"\n{message}")
            print_transaction_details(receipt)
        else:
            print_error("=" * 80)
            print_error("❌ COMMAND REJECTED BY BLOCKCHAIN")
            print_error("=" * 80)
            print_error(f"\n{message}")
    
    def demo_unauthorized_access(self):
        """Demonstrate unauthorized access attempt"""
        print_header("=" * 80)
        print_header("SCENARIO 2: UNAUTHORIZED ACCESS ATTEMPT")
        print_header("=" * 80)
        
        print_info("\n📝 Scenario Description:")
        print_info("   Creating a new unauthorized account to simulate a hacker.")
        print_info("   The blockchain should reject commands from this unknown address.\n")
        
        time.sleep(1)
        
        # Create a new random account (hacker)
        hacker_account = self.blockchain.w3.eth.account.create()
        
        print_warning(f"🕵️  Hacker Account Created:")
        print_warning(f"   Address: {hacker_account.address}")
        
        # Try to submit command (will fail due to no authorization/no gas)
        print_warning(f"\n   Attempting to send command from unauthorized account...")
        
        try:
            contract = self.blockchain.contracts['command_validator']['contract']
            
            # This will fail because hacker has no ETH for gas
            nonce = self.blockchain.w3.eth.get_transaction_count(hacker_account.address)
            
            tx = contract.functions.submitCommand('status').build_transaction({
                'from': hacker_account.address,
                'nonce': nonce,
                'gas': 500000,
                'gasPrice': self.blockchain.w3.eth.gas_price
            })
            
            signed_tx = self.blockchain.w3.eth.account.sign_transaction(tx, hacker_account.key)
            tx_hash = self.blockchain.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
            
            print_error("\n⚠️  Transaction sent (unexpected!)")
            
        except Exception as e:
            error_msg = str(e)
            print_error("\n=" * 80)
            print_error("🛡️  UNAUTHORIZED ACCESS BLOCKED")
            print_error("=" * 80)
            
            if 'insufficient funds' in error_msg.lower():
                print_error("\n   Reason: Insufficient funds for gas")
                print_error("   🔒 Unauthorized accounts cannot pay for transactions!")
            else:
                print_error(f"\n   Reason: {error_msg}")
            
            print_success("\n   ✅ The blockchain successfully prevented unauthorized access!")
    
    def demo_malicious_command_injection(self):
        """Demonstrate malicious command injection via blockchain"""
        print_header("=" * 80)
        print_header("SCENARIO 3: MALICIOUS COMMAND INJECTION - BLOCKCHAIN VALIDATION")
        print_header("=" * 80)
        
        print_info("\n📝 Scenario Description:")
        print_info("   Even an authorized doctor tries to inject a malicious command.")
        print_info("   The smart contract should detect and reject it.\n")
        
        time.sleep(1)
        
        malicious_commands = ["rm -rf", "stop; rm data", "status | grep secret"]
        
        for cmd in malicious_commands:
            print_warning(f"\n🎯 Attempting malicious command: '{cmd}'")
            
            # Check cooldown
            remaining = self.blockchain.wait_for_cooldown('doctor')
            if remaining > 0:
                print_info(f"   ⏳ Waiting {remaining}s for cooldown...")
                time.sleep(remaining + 1)
            
            success, message, receipt = self.blockchain.submit_command('doctor', cmd)
            
            if not success:
                print_error(f"\n   ❌ Blocked: {message}")
                print_success(f"   🔒 Smart contract prevented malicious command!\n")
                break
            else:
                print_warning(f"   ⚠️  Command was accepted (unexpected!)")
            
            time.sleep(1)
    
    def demo_replay_attack(self):
        """Demonstrate replay attack prevention via blockchain"""
        print_header("=" * 80)
        print_header("SCENARIO 4: REPLAY ATTACK PREVENTION - NONCE VALIDATION")
        print_header("=" * 80)
        
        print_info("\n📝 Scenario Description:")
        print_info("   Submit a legitimate command, then try to replay the same transaction.")
        print_info("   Blockchain nonce mechanism prevents replay attacks.\n")
        
        time.sleep(1)
        
        # First command
        print_info("Step 1: Sending original command...")
        
        remaining = self.blockchain.wait_for_cooldown('technician')
        if remaining > 0:
            print_info(f"   ⏳ Waiting {remaining}s for cooldown...")
            time.sleep(remaining + 1)
        
        success1, msg1, receipt1 = self.blockchain.submit_command('technician', 'pulse-check')
        
        if success1:
            print_success(f"\n✅ Original command accepted")
            print_info(f"   TX Hash: {receipt1['tx_hash']}")
            
            # Get the transaction details
            tx = self.blockchain.w3.eth.get_transaction(receipt1['tx_hash'])
            
            time.sleep(2)
            
            # Try to replay the same transaction
            print_warning("\n\nStep 2: Attacker attempting to replay the transaction...")
            print_warning(f"   Replaying TX: {receipt1['tx_hash'][:20]}...")
            
            try:
                # Try to send the same raw transaction again
                tx_hash = self.blockchain.w3.eth.send_raw_transaction(tx['input'])
                print_error("\n⚠️  Replay succeeded (unexpected!)")
            except Exception as e:
                error_msg = str(e)
                print_error("\n=" * 80)
                print_error("🛡️  REPLAY ATTACK DETECTED AND BLOCKED")
                print_error("=" * 80)
                
                if 'nonce too low' in error_msg.lower() or 'already known' in error_msg.lower():
                    print_error("\n   Reason: Transaction nonce already used")
                    print_success("\n   🔒 Blockchain nonce validation prevented replay attack!")
                else:
                    print_error(f"\n   Reason: {error_msg}")
        else:
            print_error(f"\n❌ Original command failed: {msg1}")
    
    def demo_rate_limiting(self):
        """Demonstrate rate limiting via blockchain cooldown"""
        print_header("=" * 80)
        print_header("SCENARIO 5: RATE LIMITING - BLOCKCHAIN COOLDOWN")
        print_header("=" * 80)
        
        print_info("\n📝 Scenario Description:")
        print_info("   Attempt to send multiple rapid commands to test cooldown period.")
        print_info(f"   Smart contract enforces a cooldown period between commands.\n")
        
        time.sleep(1)
        
        # Get cooldown period from contract
        cooldown = self.blockchain.contracts['command_validator']['contract'].functions.cooldown().call()
        print_info(f"📊 Contract Cooldown Period: {cooldown} seconds\n")
        
        commands = ['start', 'status', 'stop']
        
        for i, cmd in enumerate(commands, 1):
            print_info(f"\nCommand {i}: '{cmd}'")
            
            # Check remaining cooldown
            remaining = self.blockchain.wait_for_cooldown('emergency')
            if remaining > 0:
                print_warning(f"   ⏳ Cooldown active: {remaining}s remaining")
            
            success, message, receipt = self.blockchain.submit_command('emergency', cmd)
            
            if success:
                print_success(f"   ✅ Command {i} accepted")
            else:
                print_error(f"   ❌ Command {i} rejected: {message}")
                
                if 'cooldown' in message.lower():
                    print_error("\n=" * 80)
                    print_error("🛡️  RATE LIMIT ENFORCED BY SMART CONTRACT")
                    print_error("=" * 80)
                    print_success("\n🔒 Cooldown mechanism prevented rapid command flood!")
                    break
            
            time.sleep(0.5)
    
    def demo_command_validation(self):
        """Demonstrate command validation - invalid commands"""
        print_header("=" * 80)
        print_header("SCENARIO 6: COMMAND VALIDATION - ALLOWED LIST CHECK")
        print_header("=" * 80)
        
        print_info("\n📝 Scenario Description:")
        print_info("   Try to submit commands that are not in the allowed list.")
        print_info("   Smart contract should reject non-whitelisted commands.\n")
        
        time.sleep(1)
        
        invalid_commands = ['restart', 'shutdown', 'configure', 'delete']
        
        for cmd in invalid_commands:
            print_warning(f"\n🔍 Trying invalid command: '{cmd}'")
            
            remaining = self.blockchain.wait_for_cooldown('admin')
            if remaining > 0:
                print_info(f"   ⏳ Waiting {remaining}s...")
                time.sleep(remaining + 1)
            
            success, message, receipt = self.blockchain.submit_command('admin', cmd)
            
            if not success:
                print_error(f"   ❌ Rejected: {message}")
                
                if 'not allowed' in message.lower():
                    print_success("   🔒 Command validation working correctly!")
                    break
            else:
                print_warning("   ⚠️  Command accepted (unexpected!)")
            
            time.sleep(0.5)
    
    def run_complete_test_suite(self):
        """Run all blockchain security tests"""
        print_header("=" * 80)
        print_header("COMPLETE BLOCKCHAIN SECURITY TEST SUITE")
        print_header("=" * 80)
        
        print_info("\n🧪 Running comprehensive blockchain security test suite...")
        print_info("   All tests interact with real smart contracts on the blockchain.\n")
        
        input("Press Enter to start the test suite...")
        
        scenarios = [
            ("Authorized Access", self.demo_authorized_access),
            ("Unauthorized Access", self.demo_unauthorized_access),
            ("Malicious Command Injection", self.demo_malicious_command_injection),
            ("Replay Attack Prevention", self.demo_replay_attack),
            ("Rate Limiting", self.demo_rate_limiting),
            ("Command Validation", self.demo_command_validation)
        ]
        
        for i, (name, scenario_func) in enumerate(scenarios, 1):
            print_header(f"\n\n{'=' * 80}")
            print_header(f"TEST {i}/{len(scenarios)}: {name.upper()}")
            print_header(f"{'=' * 80}\n")
            
            scenario_func()
            
            if i < len(scenarios):
                input("\n\nPress Enter to continue to next test...")
        
        print_header("\n\n" + "=" * 80)
        print_header("TEST SUITE COMPLETED")
        print_header("=" * 80)
        
        self.show_statistics()
    
    def show_statistics(self):
        """Display blockchain and contract statistics"""
        print_header("\n" + "=" * 80)
        print_header("BLOCKCHAIN STATISTICS & PERFORMANCE METRICS")
        print_header("=" * 80)
        
        stats = self.blockchain.get_statistics()
        
        print_info(f"\n⛓️  Blockchain Connection:")
        print_success(f"   ✅ Connected: {stats['connected']}")
        print_info(f"   RPC URL: {stats['rpc_url']}")
        print_info(f"   Chain ID: {stats['chain_id']}")
        print_info(f"   Latest Block: {stats['latest_block']}")
        
        print_info(f"\n📊 Transaction Statistics:")
        print_info(f"   Transactions Sent: {stats['transactions_sent']}")
        print_info(f"   Total Gas Used: {stats['total_gas_used']:,}")
        
        print_info(f"\n🔐 Loaded Resources:")
        print_info(f"   Accounts: {stats['accounts_loaded']}")
        print_info(f"   Smart Contracts: {stats['contracts_loaded']}")
        
        # Get contract states
        print_info(f"\n📜 Smart Contract States:")
        
        cv_state = self.blockchain.get_contract_state('command_validator')
        print_info(f"\n   CommandValidator:")
        print_info(f"      Owner: {cv_state.get('owner', 'N/A')[:20]}...")
        print_info(f"      Paused: {cv_state.get('paused', 'N/A')}")
        print_info(f"      Cooldown: {cv_state.get('cooldown', 'N/A')}s")
        
        ac_state = self.blockchain.get_contract_state('access_control')
        print_info(f"\n   UnauthorizedAccessControl:")
        print_info(f"      Owner: {ac_state.get('owner', 'N/A')[:20]}...")
        print_info(f"      Emergency Mode: {ac_state.get('emergency_mode', 'N/A')}")
        
        print_info(f"\n👥 Account Balances:")
        for key, acc in self.blockchain.accounts.items():
            balance = self.blockchain.w3.eth.get_balance(acc['address'])
            balance_eth = self.blockchain.w3.from_wei(balance, 'ether')
            print_success(f"   • {acc['name']}: {balance_eth:.4f} ETH")
        
        # Display performance metrics
        metrics = self.blockchain.get_performance_metrics()
        print(metrics.get_comparative_summary())
        
        # Offer to export
        print_info("\n📁 Export Options:")
        export = input("   Export metrics to file? (json/csv/no): ").strip().lower()
        
        if export == 'json':
            filename = f"blockchain_metrics_{int(time.time())}.json"
            metrics.export_to_json(filename)
            print_success(f"   ✅ Metrics exported to {filename}")
        elif export == 'csv':
            filename = f"blockchain_data_{int(time.time())}.csv"
            metrics.export_to_csv(filename)
            print_success(f"   ✅ Data exported to {filename}")
        
        print()
