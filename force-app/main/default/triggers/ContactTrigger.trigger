trigger ContactTrigger on Contact (before insert, before update, before delete, after insert, after update, after undelete) {
	new ContactTriggerHandler().run();
}
