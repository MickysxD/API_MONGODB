#include <linux/proc_fs.h>
#include <linux/seq_file.h>
#include <linux/module.h>
#include <linux/init.h>
#include <linux/kernel.h>
#include <linux/sched/signal.h>
#include <linux/sched.h>
#include <linux/fs.h>

MODULE_LICENSE("GPL");
MODULE_AUTHOR("Leonel Aguilar - Sebastian Sanchez");
MODULE_DESCRIPTION("Modulo que muestra la hora del sistema");
MODULE_VERSION("0.01");

struct task_struct *task; //estructura definida en sched.h para tareas/procesos
struct task_struct *childtask; //estructura necesaria para iterar a travez de procesos secundarios
struct task_struct *memtask; 
struct list_head *list; // estructura necesaria para recorrer cada lista de tareas tarea->estructura de hijos

//Mostrar PID, nombre, PID del padre y estado
static int write_cpu(struct seq_file * cpufile, void *v){
	for_each_process( task ){
		seq_printf(cpufile, "{\n");
			seq_printf(cpufile, "\"nombre\": \"%s\",\n", task->comm);
			seq_printf(cpufile, "\"pid\": %d,\n", task->pid);
			seq_printf(cpufile, "\"padre\": %ld,\n", task->tpid);
			seq_printf(cpufile, "\"estado\": %ld,\n", task->state);
			seq_printf(cpufile, "\"usuario\": \"%s\",\n", task->uid);
			
			seq_printf(cpufile, "\"hijos\":\n");
			seq_printf(cpufile, "\t[\n");
			list_for_each( list,&task->children ){
				seq_printf(cpufile, "\t{\n");
				childtask= list_entry( list, struct task_struct, sibling);
				//printk(KERN_INFO "HIJO DE %s[%d]PID: %d PROCESO: %s ESTADO: %ld",task->comm,task->pid,childtask->pid, childtask->comm, childtask->state);
				seq_printf(cpufile, "\t\"nombre\": \"%s\",\n", childtask->comm);
				seq_printf(cpufile, "\t\"pid\": %d,\n", childtask->pid);
				seq_printf(cpufile, "\"padre\": %ld,\n", childtask->tpid);
				seq_printf(cpufile, "\t\"estado\": %ld,\n", childtask->state);
				seq_printf(cpufile, "\t\"usuario\": \"%s\",\n", childtask->uid);
				//seq_printf(cpufile, "\"ram\": %d\n",childtask->ram);
				seq_printf(cpufile, "\t},\n");
			}
			seq_printf(cpufile, "\t]\n");

		seq_printf(cpufile, "},\n");
	}

	return 0;
}

static int my_proc_open(struct inode *inode, struct file*file){
	return single_open(file, write_cpu, NULL);	
}

static ssize_t my_proc_write(struct file *file, const char __user *buffer, size_t count, loff_t *f_pos)
{
    return 0;
}

static struct file_operations my_fops = {
    .owner = THIS_MODULE,
    .open = my_proc_open,
    .release = single_release,
    .read = seq_read,
    .llseek = seq_lseek,
    .write = my_proc_write
};

static int __init cpu_init(void){ //modulo de inicio
	struct proc_dir_entry *entry;
    entry = proc_create("cpu_proyecto1", 0, NULL, &my_fops);
	
	if(!entry){
        return -1;
    }else{
		printk(KERN_INFO "@cpu_proyecto1 lectura de cpu iniciado");
    }
    return 0;
}

static void __exit cpu_exit(void){
	remove_proc_entry("cpu_proyecto1", NULL);
	printk(KERN_INFO "@cpu_proyecto1 lectura de cpu finalizado");
}

module_init(cpu_init);
module_exit(cpu_exit);